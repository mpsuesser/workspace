# Phoenix models: ranking, retrieval, training, and serving

## Scope and evidence

This manual describes the **published implementation at commit `3aa0fa336c4a20e4149b6151629b6050897bb8a5` (September 22, 2026)**. It covers the expanded Phoenix tree: the action ranker, two-tower retrieval, autoregressive semantic-ID retrieval, and continuous-embedding generative retrieval. Constants from earlier, smaller Phoenix demonstrations are not substituted for this implementation.

**Local citation convention:** every `phoenix/<path>:<lines>` below resolves to `source/phoenix/<path>` inside this skill. Line numbers refer to the pinned snapshot; the named symbol makes the reference searchable without a hosted source viewer. The [bundled Phoenix directory](../source/phoenix/) contains the executable source. No network access is needed.

Three distinctions govern interpretation:

1. **Implementation versus deployment.** A model class, configuration preset, or CLI default proves an available implementation, not the complete live configuration, experiment assignment, or model currently serving a particular viewer.
2. **Predictions versus feed utility.** Phoenix ranking predicts actions and some continuous outcomes. The downstream feed scorer combines selected predictions with weights and other adjustments. Loss weights here are training coefficients, not feed-scoring weights or exchange rates between observed engagements. See [ranking-and-weights.md](ranking-and-weights.md).
3. **Source versus artifacts.** The export includes model, training, optimizer, and serving code. It explicitly excludes production feeds, pretrained production checkpoints, multi-host orchestration, and a complete production training recipe. The runnable public rehearsal uses synthetic data. `phoenix/TRAINING.md:3–10,14–40,53–54,99–112` (`Training the Phoenix recsys model`); `phoenix/reference/README.md:1–16,50–63` (reference provenance).

### Model-family map

| Family | Input to transformer | Output | Training objective | Retrieval mechanism at serving |
|---|---|---|---|---|
| Action ranker | Viewer prefix, engagement history, candidate post tokens | Independent action logits plus configured continuous heads per candidate | Multi-label sigmoid BCE, continuous losses, activation regularization | Scores supplied candidates; does not build the candidate pool |
| Two-tower | Viewer prefix and history only | Unit user vector; separate post tower produces unit corpus vectors | Multi-positive contrastive loss with sampled/in-batch negatives | Full corpus matrix product and top-K, optionally quantized/filtered |
| SID autoregressive retrieval | Profile/history followed by teacher-forced SID codes | Conditional distribution over code values at each SID level | Per-level categorical cross-entropy | Beam code generation, then SID-prefix-to-post lookup |
| Continuous generative retrieval (`gen-recs`) | Viewer/history followed by teacher-forced candidate vectors | Predicted unit vector for the next candidate | InfoNCE against candidate target vectors | Generate vectors, full-table nearest-neighbor scoring, top-K per position |

Sources: `phoenix/xrex/models/recsys_model.py:2468–2977,2980–3744` (`RecsysAggregatedModel`); `phoenix/xrex/models/recsys_two_tower_model.py:521–854,1190–1521` (`compute_retrieval_loss`, `RecsysTwoTowerModel`); `phoenix/xrex/models/recsys_sid_retrieval_model.py:254–272,343–467` (`_pick_target`, `generate_parallel`, `loss`); `phoenix/xrex/models/recsys_gen_recs_model.py:183–365,488–679,750–881` (`RecsysGenRecsModel`, `_compute_infonce_loss`).

## 1. Published presets and dimensions

`H` is maximum history length, `C` original training-candidate count, `D` transformer width, `E` sparse-table width. These are **preset values**, not universal limits. Configuration keys acquire a dataset suffix, such as `home_direct_packed_nano_offline_kafka_dump`. Inference can override history, candidates, batch size, attention implementation, and other settings.

| Preset | H / prefix tokens / C | D / E / layers / Q heads / KV heads | Training batch per device | Important differences |
|---|---|---|---|---|
| `home_direct_packed` | 1022 / 2 / 64 | 2560 / 1024 / 8 / 20 / 4 | 256 | Feature-prep, SID 6×256 plus hash level, packed, right-anchored RoPE; Muon; H100 override |
| `home_direct_packed_gb300` | 1022 / 2 / 64 | Same | 512 | GB300 rematerialization/unrolled stack; different LR/decay/checkpoint interval |
| `home_direct_packed_nano` | 1022 / 2 / 64 | 512 / 128 / 4 / 4 / 2 | 64 | Smaller ID tables; Pallas varlen attention; computed unexplored label disabled; SID embedding dimension remains inherited 1024 |
| `xrecsys_seqpack` | 1022 / 2 / 64 | 2560 / 1024 / 8 / 20 / 4 | 256 | Legacy feature construction; packed/right-anchored; AdamW export slot; no flagship SID/feature-prep override |
| `xrecsys_search` | 1022 / 2 / 64 | 2560 / 1024 / 8 / 20 / 4 | 128 | 128 action outputs, dense action table, search-relevance prompt conditioning; not packed by default |
| `xrecsys_two_tower` | 1023 / 1 / 64 | 1024 / 1024 / 8 / 16 / 4 | 480 | No learned user/post-ID embeddings; country/language prefix; SID cross-attention; 64 global negatives; index capacity 10,240,000 |
| `xrecsys_two_tower_combined` | 1023 / 1 / 64 | 1024 / 1024 / 8 / 16 / 4 | 480 | Broader profile features; project-then-sum post tower; home+immersive heads; index capacity 28,672,000; 10% history/user-ID dropout |
| `xrecsys_two_tower_combined_gb300` | Same | Same | **960** | Executable override is 960; do not replace it with 768 from a README comparison table |
| `xrecsys_two_tower_nano` | 1022 / 0 / 64 | 512 / 512 / 4 / 4 / 2 | 64 | Unpacked; no profile prefix enabled; 64 global negatives; index capacity 65,536; SID width 512 |
| `xrecsys_sid_gen_rec_kafka` | 1023 / 1 / 64 target-selection candidates | 2560 / 1024 / 8 / 20 / 4 | 128 | Causal; six SID prediction steps, not 64 candidate tokens in the trunk; AdamW export slot |
| `xrecsys_gen_recs` | 1023 / 1 / 128 | 2560 / 1024 / 8 / 20 / 4 | 128 | Causal; MM v5 targets; 128 global negatives; index capacity 2,097,152 |
| `gen_recs_nano` | 127 / 1 / 64 | 256 / 1024 / 2 / 2 / 1 | 32 | Causal; 16 global negatives; index capacity 8192 |

Decisive configuration sources: `phoenix/xrex/configs/xrecsys.py:244–478` (`_home_direct_packed_base`, `_H100_OVERRIDES`, `_GB300_OVERRIDES`, `MODEL_CFGS`); `phoenix/xrex/configs/xrecsys_two_tower.py:250–444,517–705` (`MODEL_CFGS`, `CONFIGS`); `phoenix/xrex/configs/xrecsys_sid_retrieval.py:24–38,128–252` (`SEQUENCE_LEN`, `make_trainer`); `phoenix/xrex/configs/xrecsys_gen_recs.py:136–189,252–319` (`MODEL_CFGS`, `CONFIGS`).

### Shared transformer facts and important switches

| Setting | Interpretation / published selection |
|---|---|
| Attention key dimension | 128 in the listed constructors; query-head count need not equal `D / key_size` (two-tower D=1024 has 16 query heads) |
| FFN | Widening factor 2, nongated MLP; GELU path. Do not describe these presets as a gated SwiGLU language model |
| Precision | Model forward defaults to bfloat16; loss/log-probability calculations include float32 conversions |
| Position encoding | Rotary attention; ranker candidates share a position, whereas SID/gen-recs decoding is causal and ordered |
| Flagship home normalization | QK norm on, attention logit cap −1 (disabled), `primer_norm=False` |
| Base two-tower normalization | Constructor defaults QK norm off, soft-sign attention cap 80, primer norm on |
| Combined two-tower | QK norm on, attention cap −1, primer norm on |
| SID/gen-recs | Causal attention, cap 80 with soft-sign, primer norm on; `jax_attn` in shipped causal configurations |
| Home output cap | `final_logit_cap=-1` disables the optional final tanh cap; this differs from attention capping |
| Width scaling | `ScaleConfig.output_scale(D)=2√(512/D)` for ranking action logits; attention scale `√128/key_size` |
| MM/search-query vectors | Supported optional inputs; flagship home has MM disabled and search-query dimension zero. Having a search preset does not itself enable a nonzero query-vector dimension |

Sources: `phoenix/xrex/configs/xrecsys.py:244–295,650–704` (preset/loss construction); `phoenix/xrex/configs/xrecsys_two_tower.py:665–697` (transformer construction); `phoenix/xrex/configs/xrecsys_sid_retrieval.py:192–220`; `phoenix/xrex/configs/xrecsys_gen_recs.py:273–301`; `phoenix/xrex/models/scaling.py:10–41` (`ScaleConfig`); `phoenix/xrex/models/recsys_model.py:537–661,2897–2977` (defaults and output transform); `phoenix/xrex/models/transformer.py:54–99,300–324` (`FeedForwardConfig`, GELU FFN).

## 2. Data contract, history, and candidate construction

### Offline/training batch contract

The parser consumes session rows, not tokenized tweet text. Core columns are:

| Group | Columns / tensor meaning |
|---|---|
| Identity/sequence | `length`, `userId`, `tweetIdSeq`, `authorIdSeq`, `promotedIdSeq`, `impressedTimeMsSeq`, `clientAppIdSeq` |
| Labels | `actionNameMultiHotSeqSeq`, `continuousActionValuesSeqSeq` |
| Partition/mask | `paddingMask`, `newEventMask`; historical rows are valid non-new events; candidates are valid new events |
| User profile | `installedAppsMultiHot`; user country/language/state/DMA/gender/age and longitude/latitude/inferred-gender score columns |
| Per-post context | Product surface, timezone, directional follow flags, counts, and optional safety/semantic/query fields |
| Optional supervision/control | `semanticIdSeq`, `sampleWeight`, `authorFollowerCountSeq`, `inReplyToPostIdSeq`, `sample_source`, `searchQueryEmbeddingSeq`, `lineItemObjectiveSeq`, `safetyLabelMaskSeq`, `valueLabelValidSeq`, `valueBaselineMeanUsdSeq`, `conversionKeepMask`, `firstDpaProductKey` |

`feature_config.py` separates source-required columns from computed columns. Empty float/user-bool/user-int64 enums do not imply all array families are absent: buffers are schema-sized and later consumers select enabled fields. Sources: `phoenix/xrex/data/recsys/feature_config.py:8–183` (`CategoricalFeature`, `BoolFeature`, `Int64Feature`, user enums, `REQUIRED_COLUMNS`); `phoenix/xrex/data/recsys/recsys_batch.py:381–1050` (`from_record_batch`).

**Ordering and truncation:** `from_record_batch` takes the last `H` entries selected by `~newEventMask & paddingMask`. Without optional candidate filtering/partitioning, it takes the first `C` selected by `newEventMask & paddingMask`; gen-recs can first filter the full candidate set or move positives before negatives, then truncate to `C` (`phoenix/xrex/data/recsys/recsys_batch.py:749–776`). It does not sort these entries by timestamp. Unpacked real histories occupy the start of their buffers; remaining entries are zero-filled. Event timestamps are converted from milliseconds to int32 seconds. Post creation time is derived from the Snowflake ID: `((post_id >> 22) + 1288834974657) // 1000`. Local-time features use the published static timezone-offset mapping, not a dynamic timezone/DST database. `phoenix/xrex/data/recsys/recsys_batch.py:381–1050` (`from_record_batch`).

The distinction between history actions and candidate labels is essential: **history action outcomes are input features; the current candidate's outcome labels are supervision, not ranker inputs.** The shared candidate structure may contain labels for training, but ranker token construction does not embed them. `phoenix/xrex/models/recsys_feature_prep.py:805–937,1008–1166` (history/candidate stream builders); `phoenix/xrex/models/recsys_model.py:2468–2895` (`build_inputs`).

### Exact feature-slot inventory

These are buffer indices, not learned head weights. Presence in a buffer is distinct from being enabled as a model feature.

| Buffer | Defined indices |
|---|---|
| Post categorical | 0 product surface; 5 timezone; 6 local hour; 7 local weekday; 8 post-age bucket; 9 favorite-count bucket; 10 reply-count bucket; 11 repost-count bucket; 12 quote-count bucket; 13 view-count bucket; 14 author NSFW |
| Post boolean | 0 `isStalePost14d`; 1 author followed by viewer; 2 author following viewer |
| Post int64 | 0 client app ID; 1 promoted ID; 5 favorites; 6 replies; 7 reposts; 8 quotes; 9 views; 10 IP address; 11 first DPA product key; 12 second hash of first DPA product key |
| User categorical | 0 language; 1 country; 2 state; 3 profile gender; 4 age bracket; 5 DMA; 6 inferred gender |
| User float | 0 longitude; 1 latitude; 2 inferred-gender score; 3 age in years |

Source: `phoenix/xrex/data/recsys/feature_config.py:8–119` (feature enums). NSFW is extracted from safety-mask bit 2; author-NSFW and ads fields are not thereby enabled in flagship home feature-prep.

### Two special derived features

**Unexplored-post label, action 59.** When `compute_post_unexplored_label` is enabled, the parser replaces this candidate label using original/nonreply status, a valid timestamp, age at most 24 hours, and view count below:

`0.03 × author_followers × (1 − exp(−ln(2) × clip(age_hours,0,24) / 8)) / (1 − exp(−ln(2) × 24 / 8))`.

This is training-target construction, not proof of a fixed serving boost, an exposure quota, or an unconditional rule for all new authors. The flagship presets enable it; nano disables it. `phoenix/xrex/data/recsys/recsys_batch.py:50–80,467–493` (unexplored-label computation); `phoenix/xrex/configs/xrecsys.py:259,434`.

**Stale-post feature.** When enabled, stale candidate engagement counts are zeroed and a stale indicator is supplied. The constant named `STALE_POST_14D_TTL_SEC` is **1,213,200 seconds**; do not silently replace it with exactly 14 days (1,209,600 seconds). This preprocessing is not candidate rejection. `phoenix/xrex/data/recsys/feature_config.py:74`; `phoenix/crates/common/xai-recsys/src/util.rs:570–604` (`InputBuffer::new_with_candidates`); `phoenix/xrex/models/recsys_feature_prep.py:660–668` (`_add_context_features`).

## 3. Hashing and semantic representations

### Sparse ID hashes

For each entity and each of its two configured hashes, the implementation computes, in fixed-width integer arithmetic:

```
raw = (id × scale + bias) mod modulus
bucket = 0                           if id == 0
         raw mod (num_buckets−1) + 1 otherwise
index = 0                            if bucket == 0
        entity_offset + bucket       otherwise
```

Use the source's int64/wrapping semantics when reproducing Snowflake hashing; unbounded-integer arithmetic is not an interchangeable implementation. Both hashes for an entity address its shared table region; separate per-hash projections can then distinguish their roles. This is a fixed hash mapping followed by learned embeddings, not a collision-free ID dictionary or an interpretable per-author score.

| Entity | Two scales | Two biases | Modulus | Full home table buckets |
|---|---|---|---|---:|
| Viewer | 196742702, 1852108266 | 1935840681, 167407236 | 2859568897 | 100,000,000 |
| Post | 2161410491, 1754358832 | 1935840681, 167407236 | 2361375383 | 100,000,000 |
| Author | 371965780, 328930218 | 139686260, 37755056 | 631860353 | 30,000,000 |
| IPv4 | 529482163, 1327604891 | 742961053, 318205477 | 1073741789 | 10,000,000 |

Entity offsets are viewer `65`, post `65 + user_table_size`, author `post_offset + item_table_size`, IP `author_offset + author_table_size`. Zero IDs always remain padding index zero. Home nano uses 100,000 / 100,000 / 30,000 / 10,000 buckets respectively. The historical `ACTION_TYPE_MAP_LEN=60` participates in rounded allocation; it is **not** the size of the current shared action taxonomy.

Two-tower and SID presets remove learned user/post-ID tables but retain post hashes: `item_hash_vocab_size` can be 100,000,000 independently of `item_id_table_size=0`. They are still used for validity, frequency accounting, and the extra SID hash level. With no user table, a nonzero user ID produces a first-hash sentinel of 1 rather than a learned user identity representation. Sources: `phoenix/xrex/models/recsys_embedding.py:154–334` (`_hash_ids_batch`, `HashKeys`, `HashTable`); `phoenix/xrex/configs/xrecsys.py:128–174,403–440`; `phoenix/xrex/configs/xrecsys_two_tower.py:385–443`; `phoenix/crates/common/xai-recsys/src/model_config.rs:152–255` (Rust hash implementation).

### SID input encoding and within-post attention

A semantic ID is a sequence of residual-quantization codes, normally **six levels with 256 codes per level**. Wire/raw codes are 0–255; model buffers are uint16 1–256, reserving 0 for missing (`raw -1 → buffer 0`). Each level has its own learned embedding table with a zero padding row.

An optional seventh, hash-derived level uses the first post hash: int32 multiply by `1540483477`, XOR with its right shift by 16, then `abs(mixed) % codebook_size + 1`; it is zeroed if the first SID level is missing. It distinguishes posts that collide on semantic codes; it does not add another semantic quantizer.

The ranker flagship sums per-level embeddings (`sid_cross_attn=False`). Two-tower/SID presets can apply Q/K/V attention **between SID levels of the same post**, followed by mean aggregation and residual mean, then projection. This `sid_cross_attn` is not candidate-to-candidate transformer attention. `phoenix/xrex/models/recsys_feature_prep.py:673–802` (`_embed_entity_sid_scaled`, `_add_sid_features`); `phoenix/xrex/models/recsys_model.py:999–1078` (`embed_entity_sid`); `phoenix/xrex/configs/xrecsys.py:267–272`; `phoenix/xrex/configs/xrecsys_two_tower.py:309–314`.

SID construction itself is a separate pipeline. The release supplies RQ-KMeans/RQ-VAE codebook training and assignment code, plus synthetic providers. Neither a trained production SID codebook nor the production stream of post codes is implied by those algorithms. Snapshot names differ across paths (for example v8 corpus paths versus v5 synthetic fixtures); they are not evidence that all providers share one live version. `phoenix/reference/README.md:38–48,124–145`; `phoenix/xrex/data/retrieval_dataset.py:53–60,242–274`.

## 4. Flagship ranking tokens and context

The `feature_prep_enabled` path projects individual components into model width `D` and **adds** them. The completed user/history/candidate streams are multiplied by the configured input scale, `√D` under `ScaleConfig`. It does not concatenate every raw feature into one giant model token. Its sequence is:

```
[viewer-ID/IP token] [profile token] [history event tokens…] [candidate post tokens…]
```

| Token/component | Exact construction and active flagship home settings |
|---|---|
| Viewer token | Sum separately projected two user-hash embeddings and, if enabled, two IP-hash embeddings. Valid iff first user hash is nonzero |
| Profile token | Sum enabled country/language/location/gender/age/app features; its mask is always true when the profile token is constructed |
| Country/language | Categorical tables with cardinalities 250 and 200 |
| Location | For k=0…7, use sine/cosine of `2^k × π × latitude/90` and `2^k × π × longitude/180`; concatenate these 32 features and project to model width |
| Gender | Profile-gender categorical embedding (3 values) plus inferred-gender embedding (2 values) multiplied by inferred-gender score |
| Age | Age-bracket embedding (10 values) plus `log1p(age_years)` times a learned vector |
| Installed apps | 64-entry multihot vector projected into model width; the model does not receive arbitrary app-name text |
| History identity | Separately projected post hashes, author hashes, and SID representation, summed |
| History actions | Dense multihot action vector multiplied by learned `hist_action_emb`; simultaneous actions add rather than choose one class |
| History dwell | `clip(seconds,0,30)/30` times a learned vector |
| History click dwell | `log1p(clip(seconds,0,60))/log(61)` times a learned vector |
| Candidate identity | Post hashes, author hashes, SID representation projected/summed; optional MM/search-query projection only when configured |
| History and candidate surface | Learned categorical embedding, cardinality 16 |
| History and candidate age | Hourly bins up to 4800 minutes: 0 invalid/missing, 1–80 normal, 81 overflow; cardinality 82 |
| Time context | Timezone cardinality 32; local-hour cardinality 25 (unknown plus 24 hours). During training, 10% forward-hour dithering in flagship home |
| Relationship context | Two separate binary embeddings: author followed by viewer; author following viewer |
| Engagement counts | Ordered `[favorite, reply, repost, quote, view]`; transform each to `log2(max(count,0)+1)/32`; append constant 1; project through 64-hidden GELU MLP and add |
| Stale-post indicator | Candidate-only 2-row embedding when enabled; see exact TTL above |
| Disabled flagship components | State, DMA, weekday, continuous cyclic time-of-day/week, bridge-probability history input, direct MM vectors, and search-query vectors |

Sources: `phoenix/xrex/models/recsys_feature_prep.py:141–219,325–336,385–398,401–522,525–670,805–937,1008–1166` (`FeaturePrepConfig`, `_embed_location`, `_build_user_token`, `_build_user_features_token`, `_add_context_features`, stream builders); `phoenix/xrex/models/scaling.py:34–35` (`input_scale`); `phoenix/xrex/configs/xrecsys.py:244–304` (`_home_direct_packed_base`). Categorical inputs are clipped to their table range before one-hot lookup. A learned embedding for a missing/unknown category need not be identical to a zeroed padded sequence position.

### Legacy construction is different

The older path builds table-width representations, combines/concatenates components through reducers, and projects to transformer width when necessary. Its default `multi_hot_to_embeddings` divides one width-`E` action vector into `V` action blocks and multiplies each by `(2 × action − 1)`; it zeroes the result when all actions are absent. Thus absent actions in a nonempty event have a signed representation in this path. Search can instead enable a dense action table. Do not apply this signed-block description to the flagship dense `hist_action_emb` path.

Legacy user features are constructed through `UserFeaturesConfig` and the user-feature module rather than the flagship profile-sum implementation. The viewer reducer concatenates its hash vectors and projects to `E`, adding summed IP vectors when enabled. History concatenates post/SID/author/action and optional surface components into `proj_mat_3`; candidate identity uses its separate `proj_mat_2`, then adds optional MM/query projections. These reducers output `E` before any `E → D` transformer projection. Continuous history additions are gated by the configured active continuous losses in this older reducer.

The base two-tower legacy history builder passes its configured context but does **not** pass continuous dwell inputs in the same way the ranker does; combined two-tower feature-prep includes dwell. `phoenix/xrex/models/recsys_model.py:970–996,1081–1252,1981–2036,2350–2467,2468–2895` (user/history/candidate reducers, `multi_hot_to_embeddings`, `maybe_tfmr_project_embeddings`, `build_inputs`); `phoenix/xrex/models/recsys_two_tower_model.py:880–937` (`build_user_inputs`); `phoenix/xrex/configs/xrecsys_two_tower.py:542–576,617–664` (feature configuration).

## 5. Candidate isolation, position encoding, padding, and packing

### Attention relation

For the ranker, prefix/history are one bidirectional context. A candidate can attend to that context and its own diagonal entry, but not another candidate. History/prefix tokens cannot attend to candidates.

| Query → key | Prefix/history | Same candidate | Other candidate |
|---|---:|---:|---:|
| Prefix/history | Yes | No | No |
| Candidate | Yes | Yes | No |

The reference mask uses segment ID `1` for valid context, `−1` for valid candidates, and `0` for padding. This makes the architecture candidate-isolated for fixed features/context: competing candidates do not exchange hidden state. It does not establish independence of downstream feed scores, author adjustments, DPP reranking, or batch-derived training losses. `phoenix/xrex/pallas/ranker_attention_utils.py:16–56` (ranker attention mask); `phoenix/xrex/models/recsys_model.py:3170–3209` (segment and position construction).

**Positions:** without right anchoring, context uses sequential positions and all candidates use `prefix_length + H`. With right anchoring, real history is shifted to end at the same context boundary, all candidates still have the same position, and padding positions are zero. This avoids assigning a different rotary position merely because a candidate occupies another candidate slot. `phoenix/xrex/models/recsys_model.py:173–194` (`right_anchored_rope_positions`).

**Kernel caveat:** do not claim every available kernel implements identical padding exclusion. `PallasRankerAttention` and `PallasRankerAttentionInference` choose H100 FA3 branches that pass fixed context/candidate bounds rather than the per-example `segment_ids`; fallback paths pass the segments. Candidate-block isolation is visible in both, but per-example padded-history behavior is not identical by construction. Packed varlen paths pass segment IDs and cumulative sequence lengths. `phoenix/xrex/models/recsys_attention.py:23–190` (the three attention classes).

### Padding and sequence packing

- Nonpacked ranker inputs/targets are padded to a multiple of 128; padding is excluded from target loss. `forward` can return alignment-padding predictions as well as configured candidate slots; Rust's reply zips predictions with submitted candidates, excluding extra rows from the response. Candidate validity comes from identity-derived masks, not from whether its action labels happen to be all false.
- Packing retains the latest available history suffix for each user, allocates quantized history slots, and places leading zeros inside those slots when real history is shorter. `cu_seqlens` separates users in a packed row so their attention does not mix.
- Published home packing distribution: Beta(1,1), minimum 126, maximum 1022, mean 510, block size 128. Base/combined retrieval: minimum 0, maximum 1023, mean 511, block size 128. These are sampling/budget parameters, not a promise that every request has the mean history length.
- The packer adjusts sampled lengths to a fixed row budget. The model must use the resulting `packing_layout` (candidate positions, padding, segment IDs, cumulative lengths), not reconstruct boundaries from a single nominal length.
- Retrieval candidate arrays remain outside the history transformer when the retrieval batch contains `post_ids`; they feed the separate post tower/loss. Ranking candidates are packed into the transformer stream.
- `trained_candidate_mask` is applied in the nonpacked ranker loss path; do not assume every optional mask is handled identically by packed and nonpacked branches.

Sources: `phoenix/xrex/data/recsys/sequence_packing.py:161–428` (`pack_batch` and packing layout); `phoenix/xrex/models/recsys_model.py:3035–3045,3081–3127,3155–3217,3641–3744` (`loss`, `forward`); preset distributions in `phoenix/xrex/configs/xrecsys.py:296–303` and `phoenix/xrex/configs/xrecsys_two_tower.py:319–326,376–383`.

## 6. Ranker predictions and losses

### Action outputs

The trunk's final hidden states receive RMS normalization. Candidate states are gathered/sliced and passed through a learned biasless action projection, then multiplied by `2√(512/D)`. Optional positive `final_logit_cap` would apply `cap × tanh(logit/cap)`; default −1 disables it. Each action has a separate sigmoid probability; **there is no softmax over the action vocabulary**, and the probabilities need not sum to one. Multiple labels can be true for one event.

The standard home head width is **64**, covering numeric indices 0–63. It is not a list of 64 equally useful engagement goals: index 0 is invalid, some entries describe undo actions or notifications, and effective supervision depends on the input feed. Search uses 128 output positions. The shared proto taxonomy extends through 255; an enum entry outside a configured head's width is not a hidden additional output of that model. All enum labels are listed in §12.

Sources: `phoenix/xrex/models/recsys_model.py:2200–2340,2897–2977` (`decode`, `decode_continuous`, `__call__`); `phoenix/xrex/models/scaling.py:37–38`; `phoenix/xrex/configs/xrecsys.py:144–150,468–471`; `phoenix/python/common/xai-proto/proto/recsys.proto:300–515` (`ActionName`).

### BCE, sample weights, and negative feedback masks

For candidate `i`, action `a`, validity `m_i`, action mask `h_ia`, and weight `w_i`, the base loss is:

`L_BCE = Σ_i,a m_i h_ia w_i BCEWithLogits(z_ia, y_ia) / (Σ_i m_i w_i + 1e−10)`.

The denominator counts weighted candidate rows, **not the number of action heads**. A user-level `sampleWeight` broadcasts to the user's candidates. Default home action heads have no separate positive-versus-negative class weighting in this BCE helper; specialized masks/weights are applied before it.

| Mechanism | Actual behavior | Published home selection |
|---|---|---|
| Other-user sampled negatives | Append all `C` candidates copied from selected other users; reset action labels to false except recap-not-dwelled (12)=true; continuous labels zero | Dataset default one other-user block, so 64 original + 64 synthetic candidates before alignment |
| Sampling choice | Other users sampled without replacement; this does not prove the copied post was unseen or disliked by the target viewer | Enabled by data-feed default |
| Query-aware negative option | Optional query-similarity branch restricts candidates using cosine <0.9 and can construct two blocks | Not the general home default |
| Ranker `log_q_correction` | Compute collision-prone frequency bins from first post hash; sampled-negative weights become reciprocal counts. This is a **loss weight**, not a logit correction | On; 100M bins full size, 100K nano |
| Negative-feedback masking on synthetic negatives | Suppress negative-feedback-head BCE for fabricated negatives, rather than label all unobserved posts as reports/blocks | On |
| Co-occurring-negative override | Optional branch zeros nonnegative targets on a row that contains a configured negative action | Off |
| Search prompt conditioning | Train relevance 105/106 only if one of those labels indicates a relevance prompt response | Search preset on |
| Safety training filter | Optional mask/weight based on safety bits; separate from serving visibility filtering | Off in the discussed defaults |
| Ads branches | Source-stream head masking, MACT weighting, purchase-value supervision exist in shared model code | Not enabled merely by the home preset or the proto's ads labels |

The default synthetic-negative mask list is actions **16, 17, 19, 25, 23, 42, 27, 52, 104**, for heads present in the configured width. It differs from both the optional co-occurring-negative list and retrieval's hard-negative list. In particular, do not collapse all three into one supposed universal definition of “negative engagement.” The optional co-occurring-negative override tests **10, 17, 19, 22, 23, 25, 27, 42, 52**, retaining those negative targets while zeroing other targets on affected rows.

Sources: `phoenix/xrex/models/loss_recsys.py:17–51` (`multihot_loss_compute`); `phoenix/xrex/models/recsys_model.py:814–828,3035–3079,3230–3322` (`get_candidate_tweet_counts`, `loss`); `phoenix/xrex/data/recsys/constants.py:455–465` (`NEGATIVE_FEEDBACK_HEAD_INDICES`); `phoenix/xrex/data/recsys/recsys_batch.py:1053–1334` (`apply_negative_sampling`); `phoenix/xrex/configs/data_feeds.py:105–127,186–203` (negative defaults).

The frequency counter multiplies nonselected IDs by zero before `bincount`; consequently bin zero also accumulates nonselected/padded entries. The counter is a hash-bin statistic, not an exact post-ID frequency table or a separately estimated exposure propensity.

### Continuous slots: names do not guarantee output units

The shared proto defines six numeric slots; model tensors round to eight. The following describes the flagship ranker preset, not every possible override.

| Index | Proto name | Flagship output / training |
|---:|---|---|
| 0 | `INVALID_CONTINUOUS_ACTION_NAME` | No active semantic loss; raw projection is not a calibrated quantity |
| 1 | `DWELL_TIME` | Gallery surface: softplus followed by `300 × tanh(value/300)`, trained with Tweedie p=1.5 on target clipped to 300 sec, weight 0.1. Other surfaces: sigmoid, trained with normalized MAE on target clipped to 30 sec, weight 0.1; serving rescales sigmoid output by 30 |
| 2 | `CLICK_DWELL_TIME` | **Probability that raw click dwell is strictly >10 seconds**, sigmoid/BCE, weight 1.0 in flagship home. It is not a predicted number of seconds. The normalization config's 60 sec is not an inference multiplier for a binary head |
| 3 | `ACTIVE_SECS_5M_RESIDUAL_NORM` | No active loss in these presets; do not infer meaningful prediction from the slot name |
| 4 | `BRIDGE_PROBABILITY` | No active output loss in these presets; optional history bridge input is a separate gate |
| 5 | `ADS_WEB_CT_PURCHASE_VALUE` | Disabled for home. Optional ads branch requires action head 200 and valid delayed-stream clicked+purchase labels; softplus ratio output with Huber loss and baseline-USD metadata |
| 6–7 | No proto name | Alignment slots, not documented trained targets |

Continuous heads are projections from the normalized hidden state. Surface-specific activations/losses can share the same numeric output slot. By default continuous losses mask synthetic negatives and use the candidate validity/sample weighting. Binary threshold loss is applied to the unactivated head logit, with target `raw > threshold`. Inactive binary configuration (weight zero, as in older presets) does not turn its raw slot into a probability.

Total ranker loss is `L_BCE + Σ configured_continuous_weight × L_continuous + 5e−7 × activation_L2` for these constructors. Training coefficients 0.1/1.0/5e−7 are not downstream ranking utility weights.

Sources: `phoenix/python/common/xai-proto/proto/recsys.proto:517–524`; `phoenix/xrex/configs/xrecsys.py:661–691` (surface-specific loss configs); `phoenix/xrex/models/recsys_model.py:220–299,2270–2340,3368–3451,3511–3568,3633–3638` (`ContinuousActionLossConfig`, `_rescale_sigmoid_heads_for_inference`, `decode_continuous`, `loss`); `phoenix/xrex/models/loss_recsys.py:54–173,225–249` (continuous/binary/purchase-value helpers).

### Bias and interpretation limits

Training negatives are partly fabricated non-observations; logged positives are conditional on previous exposure, source sampling, and labeling. Reciprocal frequency weighting does not establish complete correction of exposure/position bias. Hash collisions affect learned identities and count bins. Candidate labels may co-occur; without the optional override, a positive and a negative action can both supervise their independent heads. These implementation facts preclude reading a raw loss or prediction as a causal estimate of what a post would achieve under arbitrary exposure.

Likewise, a biasless output projection does not mean “the model has no biases” in the statistical sense. Learned embeddings, input context, training distribution, and nonlinear hidden states can encode strong preferences. The source does not publish their production values or measured causal effects.

## 7. Two-tower retrieval

### Embeddings

The user tower applies the history transformer, final normalization, and a padding-masked **mean over valid prefix/history states**, then L2-normalizes the pooled vector. It is not simply the last token or an action probability vector. Cold-history behavior depends on whether a profile prefix exists; the nano has none by default.

The base candidate tower concatenates author-hash vectors and SID representation (post-ID embeddings are disabled in these presets), applies a `concatenated_width → 2E → E` biasless SiLU MLP, and L2-normalizes. With two author hashes and one SID vector this is `3E → 2E → E`. The combined preset instead independently projects and sums inputs before normalization; its config explicitly prohibits simultaneously selecting the concatenation/linear-projection arm and feature-prep project-then-sum. Candidate vectors can therefore be precomputed independently of each requesting viewer. `phoenix/xrex/models/recsys_two_tower_model.py:91–241,1190–1323` (`RecsysCandidateTower`, user pooling); `phoenix/xrex/configs/xrecsys_two_tower.py:508–515` (mutually exclusive paths).

### Positive selection and negative sets

| Retrieval setting | Exact default behavior |
|---|---|
| Home positive actions | Favorite, action 1 |
| Hard negatives | 16 report; 17 not interested; 19 see fewer; 22 unfollow author; 23 block author; 25 mute author; 42 not relevant |
| Soft negative | 12 recap-not-dwelled |
| Valid positive | Has a positive action, no hard negative, no soft negative, valid post; any enabled ads/safety restriction also applies |
| Combined immersive positives | 1 favorite, 4 reply, 5 quote, 6 repost, 13 video quality view, 21 follow author, 36 bookmark, 37 share |
| In-batch negatives | Other users' original `C` candidates on the **local data shard**, not automatically all users across all hosts |
| Global negatives | Uniform corpus samples with replacement, `N=64` per example in the listed two-tower presets; all `local_batch × N` vectors are shared negatives within the shard |
| Own negatives | Own hard/soft-negative candidates join the denominator; unlabeled own candidates do not automatically become explicit negatives |
| False-negative suppression | No general repeated-post-ID or seen/positive exclusion is shown in this loss/sampler; the same real post can occur through multiple pool entries |
| Temperature | Learned scalar initialized to 0.1; no clamp is applied in the cited loss |
| Frequency correction | Default `logq_correction_scale=2`: add `2 × log(1/count)` to temperature-scaled candidate logits; count bins use the first hash and 100M bins |
| Optional extra losses | User-user and item-item contrastive terms are supported, but disabled by listed presets |

Sources: `phoenix/xrex/models/recsys_two_tower_model.py:521–854,1538–1742` (`compute_retrieval_loss`, `RecsysTwoTowerModelConfig`); `phoenix/xrex/data/recsys/recsys_batch.py:1337–1567` (global-negative sampling); `phoenix/xrex/configs/xrecsys_two_tower.py:259–305,346–362`.

For each valid positive `p`, loss is `logsumexp([score(p), common_negatives, own_explicit_negatives]) − score(p)`. Each positive is compared independently; the model does not put all same-user positives into one competing softmax. It averages positive losses per user, then averages users with at least one positive. A batch with no valid positive contributes zero contrastive loss. `sampleWeight` is not consumed by this loss as it is by the ranker. Combined model head losses are summed, then the two-tower wrapper adds the configured user-tower activation-L2 term (5e−7 in these constructors). The temperature and frequency corrections affect training loss, not the raw retrieval dot-product score returned by the serving forward path. `phoenix/xrex/models/recsys_two_tower_model.py:1585–1633` (`loss`).

### Index construction and top-K

At checkpoint preparation, the trainer loads configured corpus datasets, hashes IDs, encodes SIDs, looks up author/post embeddings as enabled, and runs the candidate tower. It stores **post vectors, post IDs, author IDs, and dataset types** in `PostEmbeddings`. For combined retrieval, it selects a candidate head by corpus dataset: HOME→0; IMMERSIVE4Day/IMMERSIVE2Day/IMMERSIVENSFW→1. This is not a universal two-head output for each corpus row.

`RetrievalDataset.load_datasets` concatenates input corpora in the supplied order. It pads short corpora with zero IDs/PAD type and missing SIDs; if over capacity it retains the **last `max_posts` rows**. It does not establish a general globally sorted or globally deduplicated corpus. Sources: `phoenix/xrex/train/trainer_recsys.py:3404–3572` (`maybe_build_retrieval_post_embeddings`); `phoenix/xrex/data/retrieval_dataset.py:354–408` (`load_datasets`).

At inference the implementation computes user-vector × corpus-matrix scores and uses top-K selection. It is **full-table dense similarity search**, not evidence of an HNSW/FAISS approximate-nearest-neighbor index. Eligible masks, dataset masks, and optionally topic bitmaps restrict scores. Optional int8 corpus/query handling introduces quantization; otherwise unit-vector dot products are cosine similarity up to numerical precision. Scores are not sigmoid action probabilities and are not divided by the learned training temperature. `phoenix/xrex/models/recsys_two_tower_model.py:1326–1521` (`forward`); `phoenix/xrex/inference/model_runner.py:4348–4367,4750–4817,4823–5025,5108–5268` (`RetrievalModelRunner`).

### Corpus taxonomy visible in the source

| Value | Dataset | Default path/window naming (not a live-inventory guarantee) |
|---:|---|---|
| 0 | PAD | No corpus |
| 1 | HOME | SID `1fav_1day.parquet` |
| 2 | IMMERSIVE2Day | SID `video_2day.parquet` |
| 3 | RELEVANT_ADS | Relevant-ad ID/author pairs |
| 4 | CAROUSEL_ADS | Carousel-ad ID/author pairs |
| 5 | EVERGREEN | SID `video_4to14day.parquet` |
| 6 | IMMERSIVENSFW | SID `nsfw_video_2day.parquet` |
| 7 | ACTIVE_ADS | Settings-supplied ads URI |
| 8 | IMMERSIVE4Day | SID `video_4day.parquet` |
| 9 | IMAGINE | SID `imagine_4day.parquet` |
| 10 | TAIL | v5 SID `tail_1day.parquet` |
| 11 | DPA_PRODUCTS | Settings-supplied DPA URI |

Defaults resolve under `PHOENIX_INDEX_BASE`, with backups and deployment path overrides. The existence of a name/file contract does not ship its current production rows or prove the selection rule that built them. `phoenix/xrex/data/retrieval_dataset.py:30–64,242–287,411–417` (`RetrievalDataset`, `_bind_deployment_corpus_paths`). See [retrieval-and-audiences.md](retrieval-and-audiences.md) for broader candidate-source eligibility.

## 8. Autoregressive semantic-ID retrieval

This is a separate causal model, not the ranker's candidate-isolated output head.

1. Build history representations from SID/author/action/context plus the country/language profile prefix. Learned user-ID/post-ID tables are disabled in the preset.
2. Select the **first** candidate with favorite action 1, no configured hard negative, and all SID levels present. Other valid favorites are counted for metrics but are not separate training targets here. Unlike two-tower selection, recap-not-dwelled (12) is not part of `_pick_target`'s veto.
3. Teacher-force the six target code embeddings after history. Predict level 0 from the preceding history state, then each next level from the preceding teacher-forced position.
4. Apply a shared hidden projection `D → 512` with ReLU, followed by a per-level categorical head of size 256. Loss is levelwise softmax CE, weighted by `level_loss_decay^level` and normalized over those weights/valid target users; default decay is 1.
5. Beam decoding sums conditional log-softmax values. Parallel beams have a block-causal mask, share the corresponding positional indices, and cannot attend to other beams. It reruns the trunk rather than using a KV cache; parallel decoding requires supported dense JAX attention, **`jax_attn` or `jax_attn_interleaved`**. The shipped preset selects `jax_attn`. Decoding can stop at a SID prefix. Validation: `phoenix/xrex/models/recsys_sid_retrieval_model.py:400–406`.

Although the constructor sets `act_l2_weight`, the SID loss returns its SID objective without adding the ranker's activation regularization. Do not import ranker loss terms by inheritance alone. Sources: `phoenix/xrex/models/recsys_sid_retrieval_model.py:55–171,171–272,343–466,467–546` (`RecsysSIDRetrievalConfig`, `_predict_sid_level`, `_pick_target`, `generate_parallel`, `loss`); `phoenix/xrex/configs/xrecsys_sid_retrieval.py:144–220`.

### SID resolution changes the meaning of the serving score

`SidPostIndex` loads a corpus and retains rows whose first raw SID is not −1; it requires usable SID data. `SidBeamResolver` maps an exact generated prefix to corpus row indices. For each beam in order, it:

- skips an empty lookup;
- selects **only the minimum corpus row index** from a colliding prefix cell;
- deduplicates selected row indices;
- pads unfilled positions with a sentinel whose post ID is zero.

It does **not** enumerate all posts in a semantic cell or fall back to global nearest neighbors. Most importantly, `resolve_to_indices` assigns descending **ordinal scores `max_posts, …, 1`**. `SidRetrievalModelRunner.reply_request` uses these instead of beam log-probabilities and reports the first configured retrieval dataset type. Thus SID wire scores are ordering proxies, not calibrated probabilities, cosine scores, or the model's sequence log-likelihood. Default serving beam width is 1; evaluation beam defaults can differ (the SID trainer's evaluation arm uses 128).

Sources: `phoenix/xrex/inference/sid_post_index.py:18–110,125–258` (`SidPostIndex`, `SidBeamResolver.resolve_to_indices`); `phoenix/xrex/inference/sid_retrieval_runner.py:68–83,258–366` (`reply_request`, `_build_corpus_view`); `phoenix/xrex/models/recsys_sid_retrieval_model.py:55–66` (`RecsysSIDRetrievalConfig`, evaluation defaults); `phoenix/xrex/train/trainer_sid_retrieval.py:25–57` (`SidRetrievalTrainer`).

## 9. Continuous-embedding generative retrieval

The gen-recs model predicts a continuous next-item vector rather than an action distribution or discrete SID. Its causal input uses legacy viewer/post/author/action/context construction. Teacher-forced candidate vectors follow the history, and the prediction aligned to the first candidate comes from `candidate_offset−1`, preventing direct access to that candidate token at its own prediction position.

### Target spaces and training

| Target space | Construction |
|---|---|
| `mm_only` (published default) | MM vector is mapped through the candidate-space projection and L2-normalized |
| `post_combined` (optional) | Use the shared candidate reducer over post hashes, author hashes, optional product-surface embedding, and MM vector, then L2-normalize |

MM targets are valid only when the MM vector is nonzero; combined targets also require identity padding validity. Global-negative targets use the same selected target space. The candidate-index projection must match that space; comparing predicted combined vectors against an unrelated raw MM table would be invalid. `phoenix/xrex/data/recsys/gen_recs_semantics.py:20–65,91–278` (`TargetSpaceMode`, `build_target_embeddings_from_batch`, `build_global_negative_target_embeddings`, `build_candidate_space_table_from_source_features`).

The published candidate filter uses `VQV_DWELL_10S`: video-quality-view action plus dwell of at least 10 seconds. Default `PARTITION` moves positive candidates ahead of negative candidates and supplies a prediction-loss mask; negatives can remain valid contrastive target columns. Alternative `FILTER` removes them. The embedding-backed offline arm requires candidate embeddings. This is different supervision from the favorite-only home two-tower. `phoenix/xrex/configs/xrecsys_gen_recs.py:105–130,225–238`; `phoenix/xrex/data/recsys/recsys_batch.py:381–1050` (`from_record_batch`, candidate filtering/partitioning).

InfoNCE uses a fixed default temperature **0.05** and flattened local-shard candidate targets, optionally extended by global-negative targets. The correct column is the aligned target row. Optional log-Q correction subtracts estimated log-frequency from logits. Prediction masks select which rows contribute loss; target masks separately select denominator columns. Cross-shard reduction aggregates loss/count statistics, not a global all-host negative matrix. There is no general repeated-ID false-negative suppression in this loss. As with SID, the gen-recs loss returns its own objective without adding the configured ranker activation-L2 term. `phoenix/xrex/models/recsys_gen_recs_model.py:67–105,396–679,733–881` (`RecsysGenRecsModelConfig`, `forward_gen_recs`, `loss`, `_compute_infonce_loss`).

### Generation, corpus, and response order

Generation reruns the causal trunk each step. With a candidate table it selects the nearest real corpus item for feedback, and a used-item mask prevents repeating that **feedback** item. This does not prove deduplication of all final top-K results across generated positions.

`GenRecsTrainer.maybe_build_gen_recs_post_embeddings` loads MM rows from `eval_post_emb_path`, drops missing/zero vectors via the loader, keeps the **first** `max_posts` rows, projects to the selected target space, normalizes, pads, and stores the table in the checkpoint. This differs from two-tower loader's last-row truncation. Its rebuild guard caches by resolved parquet path; a changed model with the same already-built path is not automatically evidence of a freshly reprojected table.

Serving requires checkpoint `post_embeddings`; it raises an error if absent. It keeps a float32 feedback table and normalized bfloat16 scoring table. Default `num_generate=1`, `top_k_per_position=10`. It computes full-table dot products, takes top-K for each generated position, then flattens `(position, K)` order into the response. No global cross-position sort/dedup is performed in this reply function; Rust subsequently truncates to requested `top_k`. The runner disables live MM preload because it uses the checkpoint table.

Sources: `phoenix/xrex/models/recsys_gen_recs_model.py:250–365` (`_autoregressive_loop`, `generate`); `phoenix/xrex/data/recsys/gen_recs_semantics.py:388–453` (`load_mm_embedding_table`); `phoenix/xrex/train/trainer_gen_recs.py:229–402` (`maybe_build_gen_recs_post_embeddings`); `phoenix/xrex/inference/gen_recs_runner.py:59–139,218–307` (`GenRecsModelRunner`).

## 10. Rust/Python serving contract

### Pipeline and truncation

The Rust engine accepts protobuf requests, prepares fixed-shape arrays (including hashes), and batches requests. Python looks up host-resident sparse embedding rows, transfers gathered embeddings to devices, dispatches a bucket-specific JIT, transfers results back, and replies through Rust. Candidate MM embeddings and semantic IDs have separate hydration/provider paths. The ranker and retrieval runners reuse model/trainer configuration but disable optimizer state and training negative sampling for inference. `phoenix/xrex/inference/launch_inference.py:250–416` (`run`); `phoenix/xrex/inference/model_runner.py:3962–4068,4088–4152,4169–4343` (`RankingModelRunner`); `phoenix/xrex/inference/h2d.py` (`lookup_h2d_embeddings`).

For ordinary protobuf ranking requests:

- Viewer ID is candidate-set user ID when nonzero, otherwise the history sequence's user ID.
- The parser takes the last `H` aggregated history entries **before** dropping entries without a tweet or with zero tweet/author ID. It does not backfill from older discarded entries.
- It sets multihot actions only for indices below output width and sums all supplied action-metadata dwell values, converting milliseconds to seconds. This path explicitly fills dwell slot 1; it does not establish parity with every offline continuous field (notably click-dwell slot 2).
- Surface comes from the first available action metadata; history timestamp is the impressed timestamp; post creation is Snowflake-derived.
- History counts and directional follow flags are hydrated from tweet metadata. Missing context uses zero/default buffers.
- Candidate preparation takes the first `min(request_count,C)` candidates. Candidate impression time is server `now`, candidate surface comes from the candidate set, and creation time comes from its post ID. Output zipping preserves candidate input order.
- Columnar-Arrow request paths also exist; do not assume the protobuf and columnar feature coverage are interchangeable.

Sources: `phoenix/crates/common/xai-recsys/src/util.rs:449–668,777–1119,1121–1146` (`InputBuffer::new_with_candidates`, `compute_for_item`, `compute_from_columnar_bytes`); `phoenix/crates/serving/xai-recsys-engine/src/python.rs:408–465` (`PredictRequestBatch::reply`).

The ordinary retrieval protobuf helper has a narrower feature fill: SID/identity/actions/dwell/surface/local time and user profile, while its returned history boolean/float/int64 feature arrays are zero-filled. It should not be described as hydrating all ranker history count/follow features merely because the shared model supports them. `phoenix/crates/serving/xai-recsys-engine/src/util.rs:41–235` (`RetrievalInputBuffer::compute_for_item`).

### Ranker wire values: legacy field names are misleading

Python computes `jax.nn.log_sigmoid(action_logits)` and returns float32 log probabilities. Rust copies these values without exponentiating them:

| Request mode | Response field | Actual action value from this runner |
|---|---|---|
| Requested compact list | `requested_action_logits` | Log sigmoid probability in requested-index order; out-of-range index yields −∞ |
| Requested map | `index_to_logits` | Same log probability; unavailable index omitted |
| `return_logprob` | `top_log_probs` | Full log-probability vector |
| Default branch | `logits` | Still the same log-probability vector, despite field name |
| Continuous list | `continuous_actions_values` | Already transformed continuous outputs from `forward` |
| Continuous requested map | `index_to_continuous_values` | Requested continuous indices; unavailable indices omitted |

To obtain an action probability from this runner's response, use `exp(returned_value)`, not another sigmoid. This statement is about this explicit runner/Rust path, not every external client or historical service with similarly named fields. `phoenix/xrex/inference/model_runner.py:4070–4086,4264–4297`; `phoenix/crates/serving/xai-recsys-engine/src/python.rs:417–459`.

### Retrieval wire values and selection

Two-tower reply includes post ID, author ID, raw similarity score, and dataset type. Rust iterates dataset outputs in their supplied order, skips zero post IDs, appends results, and finally truncates to the request's `top_k`. That function does **not** globally merge-sort all datasets or deduplicate post IDs across them. SID and gen-recs reuse the reply contract but have the different score/order semantics described above. `phoenix/crates/serving/xai-recsys-engine/src/python.rs:819–868` (`RetrieveRequestBatch::reply`); `phoenix/xrex/inference/model_runner.py:4997–5025` (`RetrievalModelRunner.reply_request`).

### Important launcher defaults

These are **CLI defaults**, not measured production traffic or guaranteed compatible settings for every preset. A launch should name an existing compatible config and checkpoint explicitly; the parser's default config string can lag the available registry.

| Option | Published default / behavior |
|---|---|
| `history_seq_len` | 1023; note full home training preset has 1022 plus two prefix tokens |
| `candidate_seq_len` | 1400, distinct from training C=64 |
| `bs_per_device` | 4 |
| Device count | 8 |
| Batch buckets | Ranking/retrieval default per-device buckets 1 through maximum batch; separate JIT for each; actual batch padded to a bucket |
| `large_k` | 10,000 retrieval intermediate selection budget; request `top_k` is separate |
| gRPC / metrics port | 9988 / 9090 |
| Channel / in-flight | 2048 queued capacity / 2560 max in-flight requests |
| Queue age / enqueue timeout | 1200 ms / 1000 ms |
| Pipelining / pinned D2H | Enabled |
| Bloom filtering / topic filtering | Disabled unless enabled by launch options |
| Hotswap / deadline admission | Disabled unless enabled |
| Random initialization | Disabled; `allow_random_init` explicitly enables debug random init |
| SID decode | Beam width 1; decode-level override 0 means use configured full depth |
| Gen-recs | One generated position by default |

Source: `phoenix/xrex/inference/launch_inference.py:250–416,422–800` (`run`, argument parser). Read the actual invocation and `args.overrides` before treating a table entry as an operational limit. The runner also contains checkpoint loading, hot-swap, deadline, topic/bloom, quantization, and asynchronous top-K branches whose availability is not equivalent to their activation.

## 11. Training implementation and released artifacts

### Optimizer and sampling configurations

| Recipe | Dense optimizer / LR | Sparse embedding optimizer | Other published settings |
|---|---|---|---|
| Full home H100 | Muon; LR 7.1e−4; consistent RMS 0.2; matrix and Adam-embedding partition decay 0.014; fused-QKV split `qkv:128`; b1=.95, b2=.98 | Rowwise AdaGrad LR .28; accumulator half-life 2500 steps; lazy decay; weight decay 2.8e−4 | Checkpoint every 150 steps |
| Home GB300 | Muon; LR 5e−4; same RMS/QKV/betas; decays .01 | AdaGrad LR .28; half-life 5000; lazy decay; weight decay 1.4e−4 | Checkpoint every 300 steps |
| Home nano | Inherits GB300 optimizer/LR recipe | Inherits GB300 sparse recipe | Smaller dimensions/tables, not a pretrained production replica |
| Two-tower / SID / gen-recs / legacy ranker | Config slot `optim="adam"` is standard Optax AdamW in this export; two-tower/SID/full gen-recs LR .002; gen-recs nano LR .001 | Separate sparse rowwise AdaGrad | Internal tuned RMS-normalized Adam derivative is not the shipped AdamW implementation |

Sources: `phoenix/xrex/configs/xrecsys.py:307–440` (home overrides); `phoenix/xrex/configs/xrecsys_two_tower.py:250–271,339–444` (retrieval LRs); `phoenix/xrex/configs/xrecsys_sid_retrieval.py:223–249`; `phoenix/xrex/configs/xrecsys_gen_recs.py:136–189,310–324`; `phoenix/TRAINING.md:14–40` (optimizer provenance).

The readable reference step gathers used sparse rows, deduplicates hashes, differentiates dense parameters and embedding values, segment-sums repeated-row embedding gradients, and applies dense/sparse updates. It checks finite gradients (and optional dense threshold); dense and sparse validity gates are separate in this reference implementation. The trainer/configuration determines the selected optimizer, sharding, and checkpoint lifecycle. `phoenix/reference/train_step.py:29–54,65–149` (`lookup_embeddings`, `segment_sum_embeddings`, `is_valid_step`, `recsys_train_step`).

Combined retrieval's 10% empty-history augmentation zeros all history arrays and user/IP hashes for sampled users while retaining profile/candidate data. The trainer also supports a periodic all-history-empty augmentation path. These are training robustness mechanisms, not instructions to discard a viewer's production history. `phoenix/xrex/train/trainer_recsys.py:868–915` (`_apply_per_history_user_dropout`, `dataset_with_prepare`); `phoenix/xrex/configs/xrecsys_two_tower.py:270`.

Multiple feed adapters exist (Kafka/direct NumPy, Rust Kafka, dispatcher, offline Parquet, Rust Parquet, gRPC). Their column support differs; the gRPC training factory rejects stale-post mode because it does not transport the required per-post feature arrays. Network/service names and settings hooks do not provide the corresponding production feed. `phoenix/xrex/configs/data_feeds.py:105–297` (`RANKING_DATASET_FACTORIES`, `_ranking_grpc_recsys`, retrieval factory).

### What the reference programs prove

| Artifact/tool | Released status and role |
|---|---|
| `reference/world.py`, `dump_gen.py` | Seeded synthetic users/authors/topics/posts and a planted engagement model; emits Parquet session schema and manifest, not real X training sessions |
| `reference/world_snapshots.py` | Consistent synthetic MM, SID, and creation snapshots keyed to the same post IDs; train dump should reuse these SIDs |
| `reference/oss_recsys_synth.py` | Deterministic random-Fourier MM stand-ins and random-codebook SID helpers; schema compatibility does not make them learned production representations |
| `reference/mm_encoder.py` | Repository identifies this as faithful v5 renderer/ChatML/MRL algorithm port; requires separately supplied public `Qwen/Qwen3-VL-Embedding-8B` weights or endpoint; 4096→1024 truncate then L2-normalize |
| `reference/sid_codebook.py`, `sid_assign.py`, `sid_io.py` | Repository identifies these as mirrored internal codebook-training/assignment/IO source; code is released, pretrained production codebook is not |
| `reference/sid_index_server.py` | Real lookup implementation serving a supplied snapshot over `SidLookupService`; data origin remains whatever snapshot is supplied |
| `reference/sid_mock_server.py` | On-the-fly synthetic service with the same wire contract |
| `reference/gen_recs_artifacts_gen.py` | Synthetic MM memmap lookup (`post_ids.npy`, `embeddings.npy`), eval table `inference_posts.parquet`, and `global_ids.parquet` |
| `reference/train_synth.py` | Single-host/GPU offline rehearsal using shipped model/trainer; finite dump constrains available steps; saves/resumes checkpoints |
| `reference/repack_checkpoint.py` | Keeps load/inference tensors, removes optimizer/internal metadata, regenerates checksums; it does not create pretrained quality |
| `reference/retrieve_then_rank.py` | Sends dump sessions through actual `RetrieveTopKCandidates` then `PredictNextActions` gRPC servers |

Source: `phoenix/reference/README.md:18–63,65–145,174–193`; `phoenix/TRAINING.md:42–54,58–112`. The synthetic decreasing-loss rehearsal verifies that learning mechanics run; it does not establish production accuracy, calibration, recall, throughput, convergence, or reliability. Without `semanticIdSeq`, SID-enabled buffers can silently represent every post as missing SID and provide no useful SID-table gradient; the reference documentation explicitly calls this out.

## 12. Complete shared action taxonomy

**Reading this table:** names are exact `ActionName` enum symbols. Home output width 64 covers **0–63 only**. Search width 128 covers 0–127, including unnamed positions; neither configuration automatically covers ads indices 128+. An enum name establishes an identifier/contract, not a positive utility, a trained/calibrated probability in every model, or an enabled history feature. Gaps are explicitly noted.

### 0–63: positions available to standard home heads

Source for this entire table: `phoenix/python/common/xai-proto/proto/recsys.proto:300–364` (`ActionName`).

| ID | Exact label |
|---:|---|
| 0 | `INVALID_NAME` |
| 1 | `SERVER_TWEET_FAV` |
| 2 | `SERVER_TWEET_UNFAV` |
| 3 | `SERVER_TWEET_CREATE` |
| 4 | `SERVER_TWEET_REPLY` |
| 5 | `SERVER_TWEET_QUOTE` |
| 6 | `SERVER_TWEET_RETWEET` |
| 7 | `SERVER_TWEET_UNREPLY` |
| 8 | `SERVER_TWEET_UNQUOTE` |
| 9 | `SERVER_TWEET_UNRETWEET` |
| 10 | `SERVER_TWEET_REPORT` |
| 11 | `CLIENT_TWEET_RECAP_DWELLED` |
| 12 | `CLIENT_TWEET_RECAP_NOT_DWELLED` |
| 13 | `CLIENT_TWEET_VIDEO_QUALITY_VIEW` |
| 14 | `CLIENT_TWEET_PHOTO_EXPAND` |
| 15 | `CLIENT_TWEET_CLICK_MENTION_SCREEN_NAME` |
| 16 | `CLIENT_TWEET_REPORT` |
| 17 | `CLIENT_TWEET_NOT_INTERESTED_IN` |
| 18 | `CLIENT_TWEET_UNDO_NOT_INTERESTED_IN` |
| 19 | `CLIENT_TWEET_SEE_FEWER` |
| 20 | `CLIENT_TWEET_UNDO_SEE_FEWER` |
| 21 | `CLIENT_TWEET_FOLLOW_AUTHOR` |
| 22 | `CLIENT_TWEET_UNFOLLOW_AUTHOR` |
| 23 | `CLIENT_TWEET_BLOCK_AUTHOR` |
| 24 | `CLIENT_TWEET_UNBLOCK_AUTHOR` |
| 25 | `CLIENT_TWEET_MUTE_AUTHOR` |
| 26 | `CLIENT_TWEET_UNMUTE_AUTHOR` |
| 27 | `CLIENT_TWEET_MUTE_CONVERSATION` |
| 28 | `CLIENT_TWEET_UNMUTE_CONVERSATION` |
| 29 | `CLIENT_TWEET_CLICK` |
| 30 | `CLIENT_TWEET_CLICK_PROFILE` |
| 31 | `CLIENT_TWEET_CLICK_SHARE` |
| 32 | `CLIENT_TWEET_SHARE_VIA_COPY_LINK` |
| 33 | `CLIENT_TWEET_CLICK_SEND_VIA_DIRECT_MESSAGE` |
| 34 | `CLIENT_TWEET_UNBOOKMARK` |
| 35 | `CLIENT_TWEET_CLICK_HASHTAG` |
| 36 | `CLIENT_TWEET_BOOKMARK` |
| 37 | `CLIENT_TWEET_SHARE` |
| 38 | `CLIENT_QUOTED_TWEET_CLICK` |
| 39 | `CLIENT_TWEET_OPEN_LINK` |
| 40 | `CLIENT_TWEET_TAKE_SCREENSHOT` |
| 41 | `CLIENT_TWEET_TRANSLATE_CLICK` |
| 42 | `CLIENT_TWEET_NOT_RELEVANT` |
| 43 | `CLIENT_TWEET_UNDO_NOT_RELEVANT` |
| 44 | `CLIENT_CARD_CLICK` |
| 45 | `CLIENT_TWEET_SHOW_MORE_EXPAND` |
| 46 | `CLIENT_TWEET_CLICK_GROK_ANALYZE` |
| 47 | `CLIENT_TWEET_VIDEO_OPEN` |
| 48 | `CLIENT_QUOTED_TWEET_VIDEO_QUALITY_VIEW` |
| 49 | `CLIENT_QUOTED_TWEET_PHOTO_EXPAND` |
| 50 | `CLIENT_NOTIFICATION_OPEN` |
| 51 | `CLIENT_NOTIFICATION_CLICK` |
| 52 | `CLIENT_NOTIFICATION_SEE_LESS_OFTEN` |
| 53 | `CLIENT_NOTIFICATION_DISMISS` |
| 54 | `CLIENT_APP_ENTER` |
| 55 | `CLIENT_APP_EXIT` |
| 56 | `CLIENT_NOTIFICATION_IMPRESSION` |
| 57 | `CLIENT_PROFILE_CLICK` |
| 58 | `CLIENT_NOTIFICATION_SENT` |
| 59 | `SERVER_TWEET_POST_UNEXPLORED` |
| 60 | `CLIENT_TWEET_EXTERNAL_LINK_LONG_DWELLED` |
| 61 | `SERVER_PROFILE_FOLLOW` |
| 62 | `SERVER_PROFILE_UNFOLLOW` |
| 63 | `SERVER_PROFILE_BLOCK` |

### 64–127: additional shared/search positions

Source: `phoenix/python/common/xai-proto/proto/recsys.proto:365–409` (`ActionName`).

| ID | Exact label |
|---:|---|
| 64 | `SERVER_PROFILE_UNBLOCK` |
| 65 | `SERVER_PROFILE_MUTE` |
| 66 | `SERVER_PROFILE_UNMUTE` |
| 67 | `SERVER_PROFILE_REPORT` |
| 68 | `CLIENT_TWEET_CAROUSEL_SWIPE_NEXT` |
| 69 | `CLIENT_TWEET_CAROUSEL_SWIPE_PREVIOUS` |
| 70 | `CLIENT_EXTERNAL_LINK_SESSION` |
| 71 | `CLIENT_TWEET_RENDER_IMPRESSION` |
| 72 | `CLIENT_TWEET_DETAILS_IMPRESSION` |
| 73 | `CLIENT_TWEET_IMMERSIVE_IMPRESSION` |
| 74 | `CLIENT_TWEET_VIDEO_PLAYBACK_START` |
| 75 | `CLIENT_TWEET_VIDEO_PLAYBACK_COMPLETE` |
| 76 | `CLIENT_TWEET_VIDEO_PLAYBACK_25` |
| 77 | `CLIENT_TWEET_VIDEO_PLAYBACK_50` |
| 78 | `CLIENT_TWEET_VIDEO_PLAYBACK_75` |
| 79 | `CLIENT_TWEET_VIDEO_PLAYBACK_95` |
| 80 | `CLIENT_TWEET_VIDEO_HEARTBEAT` |
| 81 | `CLIENT_TWEET_VIDEO_MRC_VIEW` |
| 82 | `CLIENT_TWEET_VIDEO_VIEW` |
| 83 | `CLIENT_TWEET_VIDEO_VIEW_THRESHOLD` |
| 84 | `CLIENT_TWEET_VIDEO_6SEC_VIEW` |
| 85 | `CLIENT_TWEET_VIDEO_WATCH_TIME` |
| 86 | `CLIENT_EXTERNAL_LINK_SESSION_LESS_THAN_3_SEC` |
| 87 | `CLIENT_EXTERNAL_LINK_SESSION_LESS_THAN_5_SEC` |
| 88 | `CLIENT_EXTERNAL_LINK_SESSION_LESS_THAN_10_SEC` |
| 89 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_30_SEC` |
| 90 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_60_SEC` |
| 91 | `CLIENT_TWEET_VIDEO_PLAY_FROM_TAP` |
| 92 | `CLIENT_TWEET_GALLERY_IMPRESSION` |
| 93 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_3_SEC` |
| 94 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_5_SEC` |
| 95 | `CLIENT_TWEET_VIDEO_PLAYBACK_START_WITH_50PCT_VIEW` |
| 96 | `CLIENT_TWEET_VIDEO_PLAYBACK_COMPLETE_WITH_50PCT_VIEW` |
| 97 | `CLIENT_TWEET_VIDEO_PLAYBACK_25_WITH_50PCT_VIEW` |
| 98 | `CLIENT_TWEET_VIDEO_PLAYBACK_50_WITH_50PCT_VIEW` |
| 99 | `CLIENT_TWEET_VIDEO_PLAYBACK_75_WITH_50PCT_VIEW` |
| 100 | `DPA_IMPRESSION` |
| 101 | `DPA_CLICK` |
| 102 | `BRAND_ENGAGEMENT` |
| 103 | `CLIENT_TWEET_DETAIL_DWELL` |
| 104 | `CLIENT_TWEET_SEARCH_QUERY_REFORMULATED` |
| 105 | `CLIENT_TWEET_RELEVANT_TO_SEARCH` |
| 106 | `CLIENT_TWEET_NOT_RELEVANT_TO_SEARCH` |
| 107 | `CLIENT_TWEET_LIVE_STREAM_REPLY` |
| 108 | `RESERVED_108` |
| 109–127 | No named values in this enum |

### 128–255: extended shared/ads taxonomy

Source: `phoenix/python/common/xai-proto/proto/recsys.proto:411–515` (`ActionName`). These are outside both the standard home and 128-wide search heads.

| ID | Exact label |
|---:|---|
| 128 | `ADS_WEB_CONVERSION` |
| 129 | `ADS_VIDEO_VIEW` |
| 130 | `ADS_CLICK` |
| 131 | `ADS_DWELL_LONG` |
| 132 | `ADS_POSITIVE_ENG` |
| 133 | `ADS_SOCIAL_ENG` |
| 134 | `ADS_NEGATIVE_ENG` |
| 135 | `ADS_ATTRIBUTED_KEY_CLICK_CONVERSION` |
| 136 | `ADS_ATTRIBUTED_CLICK_CONVERSION` |
| 137 | `ADS_ATTRIBUTED_KEY_VIEW_CONVERSION` |
| 138 | `ADS_ATTRIBUTED_VIEW_CONVERSION` |
| 139 | `ADS_ATTRIBUTED_MACT_CLICK_INSTALL` |
| 140 | `ADS_ATTRIBUTED_MACT_VIEW_INSTALL` |
| 141 | `ADS_ATTRIBUTED_MACT_CLICK_THRU_LOWER_FUNNEL_EVENT` |
| 142 | `ADS_ATTRIBUTED_MACT_VIEW_THRU_LOWER_FUNNEL_EVENT` |
| 143 | `ADS_DOWNLOAD_CONVERSION` |
| 144 | `ADS_SIGN_UP_CONVERSION` |
| 145 | `ADS_CUSTOM_CONVERSION` |
| 146 | `ADS_ADD_TO_WISHLIST_CONVERSION` |
| 147 | `ADS_CHECKOUT_INITIATED_CONVERSION` |
| 148 | `ADS_SEARCH_CONVERSION` |
| 149 | `ADS_CONTENT_VIEW_CONVERSION` |
| 150 | `ADS_ADDED_PAYMENT_INFO_CONVERSION` |
| 151 | `ADS_SUBSCRIBE_CONVERSION` |
| 152 | `ADS_START_TRIAL_CONVERSION` |
| 153 | `ADS_PRODUCT_CUSTOMIZATION_CONVERSION` |
| 154 | `ADS_SESSION_CONVERSION` |
| 155 | `ADS_LANDING_PAGE_VIEW_CONVERSION` |
| 156 | `ADS_SITE_VISIT_CONVERSION` |
| 157 | `ADS_COMPLETE_REGISTRATION_CONVERSION` |
| 158 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_15_SEC` |
| 159 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_20_SEC` |
| 160 | `CLIENT_EXTERNAL_LINK_SESSION_MORE_THAN_25_SEC` |
| 161 | `CLIENT_TWEET_RELEVANT_TO_SEARCH_DEPRECATED` |
| 162 | `CLIENT_TWEET_NOT_RELEVANT_TO_SEARCH_DEPRECATED` |
| 163 | `CLIENT_TWEET_REPLY_DOWNVOTE` |
| 164 | `ADS_LONG_DWELL_10_SEC_AND_ATTRIBUTED_CONVERSION` |
| 165 | `ADS_LONG_DWELL_15_SEC_AND_ATTRIBUTED_CONVERSION` |
| 166 | `ADS_LONG_SITE_DWELL_CONVERSION` |
| 167 | `P_OPEN_LINK_P10` |
| 168 | `P_OPEN_LINK_P25` |
| 169 | `P_OPEN_LINK_P50` |
| 170 | `P_OPEN_LINK_P75` |
| 171 | `ADS_ATTRIBUTED_MACT_PURCHASE` |
| 172 | `ADS_ATTRIBUTED_MACT_ADD_TO_CART` |
| 173 | `ADS_ATTRIBUTED_MACT_LEVEL_ACHIEVED` |
| 174 | `ADS_ATTRIBUTED_MACT_TUTORIAL_COMPLETE` |
| 175 | `ADS_ATTRIBUTED_MACT_SIGN_UP` |
| 176 | `ADS_ATTRIBUTED_MACT_CUSTOM` |
| 177 | `ADS_ATTRIBUTED_MACT_VIEW_PURCHASE` |
| 178 | `ADS_ATTRIBUTED_MACT_VIEW_ADD_TO_CART` |
| 179 | `ADS_ATTRIBUTED_MACT_VIEW_LEVEL_ACHIEVED` |
| 180 | `ADS_ATTRIBUTED_MACT_VIEW_TUTORIAL_COMPLETE` |
| 181 | `ADS_ATTRIBUTED_MACT_VIEW_SIGN_UP` |
| 182 | `ADS_ATTRIBUTED_MACT_VIEW_CUSTOM` |
| 183 | `ADS_PURCHASE_CONVERSION_VIEW_THROUGH` |
| 184 | `ADS_ADD_TO_CART_CONVERSION_VIEW_THROUGH` |
| 185 | `ADS_CHECKOUT_INITIATED_CONVERSION_VIEW_THROUGH` |
| 186 | `ADS_SIGN_UP_CONVERSION_VIEW_THROUGH` |
| 187 | `ADS_SITE_VISIT_CONVERSION_VIEW_THROUGH` |
| 188 | `ADS_SESSION_CONVERSION_VIEW_THROUGH` |
| 189 | `ADS_LANDING_PAGE_VIEW_CONVERSION_VIEW_THROUGH` |
| 190 | `ADS_UPPER_FUNNEL_CONVERSION_VIEW_THROUGH` |
| 191 | `ADS_PIXEL_FIRE` |
| 192 | `ADS_LONG_DWELL_AND_PIXEL_FIRE` |
| 193 | `P_LONG_DWELL_AND_PIXEL_FIRE` |
| 194–199 | No named values in this enum |
| 200 | `ADS_PURCHASE_CONVERSION` |
| 201 | `ADS_MID_FUNNEL_CONVERSION` |
| 202 | `ADS_ADD_TO_CART_CONVERSION` |
| 203 | `ADS_UPPER_FUNNEL_CONVERSION` |
| 204 | `ADS_ATTRIBUTED_KEY_CLICK_CONVERSION_DELAYED` |
| 205 | `ADS_ATTRIBUTED_CLICK_CONVERSION_DELAYED` |
| 206 | `ADS_PURCHASE_CONVERSION_DELAYED` |
| 207 | `ADS_MID_FUNNEL_CONVERSION_DELAYED` |
| 208 | `ADS_ADD_TO_CART_CONVERSION_DELAYED` |
| 209 | `ADS_UPPER_FUNNEL_CONVERSION_DELAYED` |
| 210 | `ADS_WEB_CONVERSION_DELAYED` |
| 211 | `ADS_SEARCH_CONVERSION_DELAYED` |
| 212 | `ADS_SIGN_UP_CONVERSION_DELAYED` |
| 213 | `ADS_CHECKOUT_INITIATED_CONVERSION_DELAYED` |
| 214 | `ADS_ATTRIBUTED_KEY_CLICK_CONVERSION_DELAYED_TIER_2` |
| 215 | `ADS_ATTRIBUTED_CLICK_CONVERSION_DELAYED_TIER_2` |
| 216 | `ADS_PURCHASE_CONVERSION_DELAYED_TIER_2` |
| 217 | `ADS_MID_FUNNEL_CONVERSION_DELAYED_TIER_2` |
| 218 | `ADS_ADD_TO_CART_CONVERSION_DELAYED_TIER_2` |
| 219 | `ADS_UPPER_FUNNEL_CONVERSION_DELAYED_TIER_2` |
| 220 | `ADS_WEB_CONVERSION_DELAYED_TIER_2` |
| 221 | `ADS_SEARCH_CONVERSION_DELAYED_TIER_2` |
| 222 | `ADS_SIGN_UP_CONVERSION_DELAYED_TIER_2` |
| 223 | `ADS_CHECKOUT_INITIATED_CONVERSION_DELAYED_TIER_2` |
| 224 | `ADS_ATTRIBUTED_KEY_CLICK_CONVERSION_DELAYED_TIER_3` |
| 225 | `ADS_ATTRIBUTED_CLICK_CONVERSION_DELAYED_TIER_3` |
| 226 | `ADS_PURCHASE_CONVERSION_DELAYED_TIER_3` |
| 227 | `ADS_MID_FUNNEL_CONVERSION_DELAYED_TIER_3` |
| 228 | `ADS_ADD_TO_CART_CONVERSION_DELAYED_TIER_3` |
| 229 | `ADS_UPPER_FUNNEL_CONVERSION_DELAYED_TIER_3` |
| 230 | `ADS_WEB_CONVERSION_DELAYED_TIER_3` |
| 231 | `ADS_SEARCH_CONVERSION_DELAYED_TIER_3` |
| 232 | `ADS_SIGN_UP_CONVERSION_DELAYED_TIER_3` |
| 233 | `ADS_CHECKOUT_INITIATED_CONVERSION_DELAYED_TIER_3` |
| 234–252 | Explicit proto reserved range |
| 253 | `P_OPEN_LINK_P90` |
| 254 | `ADS_MMP_CLICK` |
| 255 | `PLACE_HOLDER_255` |

`ActionGroup` is another enum, not the action-output axis: 0 INVALID_GROUP; 1 P_FAV; 2 P_REPLY; 3 P_RETWEET; 4 P_CLICK; 5 P_DWELL; 6 P_SHARE; 7 P_BOOKMARK; 8 P_FOLLOW; 9 P_REPORT; 10 P_BLOCK; 11 P_MUTE; 12 P_VQV; 13 P_NEXT. `ActionCategory` is 0 INVALID_CATEGORY, 1 TWEET, 2 AUTHOR. `phoenix/python/common/xai-proto/proto/recsys.proto:526–547`.

## 13. Audit boundaries and source navigation

### Established by this snapshot

- Exact preset architectures, ID hashing, enabled flagship features, token construction, loss formulas, and model output transforms.
- Four distinct model families and their different supervision and serving scores.
- Candidate-isolated ranker attention, causal generative attention, packing/truncation behavior, and important kernel/path differences.
- Full action and continuous-slot contracts, training/sampling configuration, checkpoint corpus construction, and Rust response behavior.
- A runnable synthetic rehearsal plus real algorithm/service implementations with explicit artifact provenance.

### Not established / missing inputs

- Learned production parameters, user/post/author embedding values, trained production SID codebooks, and production corpus snapshots.
- Complete production data selection, labels/delays, exposure propensities, source mixtures, live training schedule, and optimizer variant for the internal Adam slot.
- Actual production launch flags, experiment overrides, enabled feed/model family per request, operational capacities, and deployment prevalence of optional branches.
- Production accuracy, calibration, fairness, recommendation quality, causal reach effects, or a guaranteed gain from any author tactic.
- Exact parity among every Python/Rust, protobuf/columnar, hardware-kernel, and optional ads extension path. This manual identifies material visible differences rather than treating shared type names as proof of parity.
- Complete conversion from these serving responses into Home Mixer's external `PhoenixScores` type. `home-mixer/models/candidate.rs:6` reexports that type; `home-mixer/scorers/phoenix_scorer.rs:95–110` delegates prediction and invokes external `candidate_scores`. The client conversion implementation is absent, so wire slots alone do not establish downstream field calibration or units.

### Useful source entry points for deeper questions

| Question | Local source / symbol |
|---|---|
| Input feature gating and shape | `phoenix/xrex/models/recsys_feature_prep.py:141–219` — `FeaturePrepConfig`; `phoenix/xrex/data/recsys/feature_config.py:8–183` — column/slot enums |
| Ranker construction and forward | `phoenix/xrex/models/recsys_model.py:2468–2977,3641–3744` — `build_inputs`, `__call__`, `forward` |
| Ranker loss/metrics separation | `phoenix/xrex/models/recsys_model.py:2980–3638` — `loss`; metric computation is not an extra downstream feed-scoring objective |
| Candidate sampling | `phoenix/xrex/data/recsys/recsys_batch.py:1053–1567` — negative-sampling methods |
| Attention/padding | `phoenix/xrex/models/recsys_attention.py:23–190`; `phoenix/xrex/pallas/ranker_attention_utils.py:16–56`; `phoenix/xrex/models/recsys_model.py:173–194`; `phoenix/xrex/data/recsys/sequence_packing.py:161–428` |
| Two-tower scoring/loss | `phoenix/xrex/models/recsys_two_tower_model.py:521–854,1190–1521` — `compute_retrieval_loss`, user pooling, `forward` |
| Corpus loading/building | `phoenix/xrex/data/retrieval_dataset.py:242–417`; `phoenix/xrex/train/trainer_recsys.py:3404–3572` |
| SID lookup collision policy | `phoenix/xrex/inference/sid_post_index.py:196–248` — `SidBeamResolver.resolve_to_indices` |
| Gen-recs target/index agreement | `phoenix/xrex/data/recsys/gen_recs_semantics.py:170–278`; `phoenix/xrex/train/trainer_gen_recs.py:229–402` |
| Wire action values | `phoenix/xrex/inference/model_runner.py:4264–4297`; `phoenix/crates/serving/xai-recsys-engine/src/python.rs:417–459` |
| Serving request features | `phoenix/crates/common/xai-recsys/src/util.rs:449–668,777–1119`; retrieval-specific `phoenix/crates/serving/xai-recsys-engine/src/util.rs:41–235` |
| Launch overrides | `phoenix/xrex/inference/launch_inference.py:250–416` — `run`; argument parser follows |
| Public versus production artifacts | `phoenix/TRAINING.md:8–40,99–112`; `phoenix/reference/README.md:18–63,99–145` |

For effects on final placement, continue with [ranking-and-weights.md](ranking-and-weights.md), [pipeline-and-filters.md](pipeline-and-filters.md), and [visibility-and-labels.md](visibility-and-labels.md). Phoenix's model score is one stage of that broader system.
