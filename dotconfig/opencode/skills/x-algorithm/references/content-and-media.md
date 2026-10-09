# Content understanding, media models, and post representations

## Scope and evidence rules

Audit of `xai-org/x-algorithm` at **`3aa0fa336c4a20e4149b6151629b6050897bb8a5`**. Scope: `grox/`, `media-model-proxy/`, `clip/`, `adult-content/`, `pnsfwmedia/`. Paths and line numbers below refer to this snapshot, available in the skill's bundled **`source/`** directory. For an obscure implementation detail, read the cited file there rather than extrapolating from a component name. These are source-defined behaviors and defaults, not a claim that every registered flow or configured model is deployed to every post.

**The essential distinction:** a representation is not a verdict; a verdict is not an applied label; an applied label is not a universal ranking multiplier. Grox produces embeddings, UPA annotations, PTOS annotations/actions, and reply scores through different plans. Media-model-proxy returns model `DataRecord`s. CLIP and the two adult-media directories contain training/export code. To establish a For You consequence, trace the relevant output into the consuming retrieval, ranker, or visibility rule; these directories alone do not establish a reach percentage, guaranteed distribution, or a general penalty for a format/topic.

### Navigation

1. [System and model inventory](#system-and-model-inventory)
2. [What the models can see](#what-the-models-can-see)
3. [UPA: descriptions, tags, topics, and boolean metadata](#upa-descriptions-tags-topics-and-boolean-metadata)
4. [PTOS: safety taxonomy, routing, cross-validation, and actions](#ptos-safety-taxonomy-routing-cross-validation-and-actions)
5. [Reply quality and spam](#reply-quality-and-spam)
6. [Multimodal embeddings](#multimodal-embeddings)
7. [Async lifecycle, caches, and failure semantics](#async-lifecycle-caches-and-failure-semantics)
8. [Media-model-proxy](#media-model-proxy)
9. [CLIP, adult-content, and pnsfwmedia training](#clip-adult-content-and-pnsfwmedia-training)
10. [Composition/reach questions and evidence gaps](#compositionreach-questions-and-evidence-gaps)

## System and model inventory

| Component / symbol | Input | Output | What this establishes |
|---|---|---|---|
| `BangerInitialScreenGemmaClassifier` | Rendered author, post, hydrated media/cards/quote, externally fetched topic taxonomy | Description, tags, topic scores, seven optional booleans, image-editability, slop score, minor score | Content annotation, not a disclosed virality score. `grox/flows/upa/classifier_banger_initial_screen_gemma.py:44-85,106-154`. |
| `PostSafetyDeluxeClassifier` | Author + `PostRenderer`, Grok 4.1 fast hedgehog critical | Required `tweet_bool_metadata` wrapper | Alternate UPA safety screen. `grox/flows/upa/classifier_post_safety_screen_deluxe.py:19-75`; `grox/flows/upa/state_post_safety.py:8-9` in the same directory. |
| `SafetyPtosCategoryClassifier` | Author + post + media, category system prompt | List of suspected categories, score/reason, optional policy | First stage, not final enforcement. `grox/flows/ptos/classifier.py:104-182`; `grox/flows/ptos/state.py:80-88`. |
| `SafetyPtosPolicyClassifier` | Category-specific prompt + post; thread for violent speech/self-harm replies | Policy enum, optional integer confidence and reason | Refines selected categories; unsupported categories return `None`. `grox/flows/ptos/classifier.py:472-723`. |
| `SafetyPtosChildSafetyPolicyClassifier` / `SafetyPtosPolicyCrossValidator` | Child-safety date-conditioned prompt / independent policy review | Policy or explicit no-violation/downgrade outcome | Category-specific confirmation, not a generic confidence cutoff. `grox/flows/ptos/classifier.py:197-469`. |
| `TaskSafetyPtosSafemodelSexNudity` | Individual hydrated images/video frames; classifier slug `sex-and-nudity`, version `0`, checkpoint path | Prediction bucket and confidence, aggregated scored/positive/max-positive-confidence | `R` or `X` is positive; full bucket vocabulary and model internals are absent. `grox/flows/ptos/task_safety_ptos_safemodel_sex_nudity.py:22-33,63-141,195-270`. |
| `SafetyPtosAdultContentCrossValidationJudge` | Adult policy prompt + author/post/media | `SafetyPolicy` from Grok 4.5 | Judges disagreements in selected deluxe flows. `grox/flows/ptos/classifier.py:726-766`. |
| `TaskSafetyPtosMediaInjectedAdultInfraredVideoSpamDetection` | Post storyboards plus external reference-video bundle | `violation: bool`, optional reason → `SpamManipulatedMedia` or empty annotations | Reference comparison; classifier name does not reveal the missing rubric. `grox/flows/ptos/task_safety_ptos_media_injected_adult_infrared_video_spam_detection.py:46-71,101-189`. |
| `ReplyScorer` / `SimpleReplyScorer` | Thread, author, selected account/client signals, images/frames | Float score **0–3**, reason | Scores are persisted; exact meanings of 1/2/3 omitted with prompts. Zero drives spam labeling. `grox/flows/reply_spam/classifier_reply_ranking.py:30-94,109-172`; `grox/flows/reply_spam/classifier_simple_reply_scorer.py:25-71,87-150`. |
| `CoordinatedSpamScorer` / `MultiStepReplySpamScorer` | Indexed thread + author/media | Spam post indexes/IDs + reason, narrowed by code guards | Multi-post detections write zero reply scores. `grox/flows/reply_spam/classifier_coordinated_spam.py:24-137,153-222`; `grox/flows/reply_spam/classifier_multi_step_reply_spam.py:25-142,157-226`. |
| `MultimodalPostEmbedderV5`, `V82`, `V8Search`, `V8SearchBackfill` | Version-specific text/image rendering; ASR where hydrated | L2-normalized float vector | Search/recommendation representations; neither safety verdicts nor scalar rank scores. `grox/flows/mm_emb/embedder.py:14-52,54-116`; `grox/flows/mm_emb/embedder_v82.py:19-114`; `grox/flows/mm_emb/embedder_v8_search.py:23-113`. |
| Media-model-proxy's seven registered descriptors | Raw media bytes plus optional media category | Per-model sequences of `DataRecord`s | Model-service front end; most output taxonomies are not defined in the descriptors. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/ModelDescriptorRegistry.scala:7-27`. |
| `TwitterCLIP` | Image or tokenized text | Normalized embeddings; cross-modal similarity logits | Contrastive representation training/export. `clip/model.py:34-145,160-243`. |
| `adult-content.build_model` | Usually 256-dimensional media embedding | Binary sigmoid output | Supervised adult-media head and calibration utilities. `adult-content/training.py:13-42`; `adult-content/config.py:5-20`. |
| `pnsfwmedia.Model` | Media embedding through a frozen loaded model + account-health features | Binary sigmoid output | Experimental joint media/account classifier, not evidence of a universal account reach formula. `pnsfwmedia/model_experimental.py:17-92`. |

### Exact prompt availability

The release explicitly excludes Grox Jinja prompts: `README.md:424`; `grox/flows/upa/prompts.py:11`; `grox/flows/ptos/prompts.py:11`; `grox/flows/reply_spam/prompts.py:11`. Prompt **filenames**, call arguments, visible wrapper instructions, schemas, parsers, and subsequent actions are observable. The omitted definitions, positive/negative examples, linguistic exceptions, subjective quality/slop rubric, and complete safety reasoning instructions are not.

| Prompt family | Omitted files / visible parameters | Source |
|---|---|---|
| UPA | `banger_mini_vlm_screen_score_gemma.j2` with `topics`; `post_safety_deluxe.j2` | `grox/flows/upa/prompts.py:14-22` |
| PTOS | `safety_ptos.j2`; `violent_media_policy.j2`; `adult_content_policy.j2`; `spam_policy.j2`; `illegal_and_regulated_behaviors_policy.j2`; `hate_or_abuse_policy.j2`; `violent_speech_policy.j2`; `suicide_or_self_harm_policy.j2`; `child_safety_policy.j2` with `post_creation_time`; `media_injected_adult_infrared_video_spam_detection.j2` | `grox/flows/ptos/prompts.py:14-64` |
| Replies | `reply_scoring_system.j2`, `reply_scoring_system_simple.j2`, each with `large_account_follower_threshold` (call sites use 100,000); `coordinated_spam_system.j2`; `multi_step_reply_spam_system.j2` | `grox/flows/reply_spam/prompts.py:14-35`; `grox/flows/reply_spam/classifier_reply_ranking.py:55-60`; `grox/flows/reply_spam/classifier_simple_reply_scorer.py:46-54` |

Visible embedding instructions are reproduced in the embedding section. ASR's visible instruction is exactly **“Transcribe this audio.”**, with request model `default` (`grox/core/data_loaders/asr_processor.py:124-140`). Motion-reveal instructions are visible in `grox/core/lm/convo.py:25-31`: subtracting static layers/amplifying moving layers can distort colors/textures; judge revealed content as part of the video and prefer its severity over a decoy. This is a visible supplemental instruction, **not** the complete safety prompt.

## What the models can see

### Shared post representation and renderers

`Post` preserves text, detected post language, counts, URLs, media, URL videos, media descriptions, quote, cards, broadcasts, creation time, ancestors, screenshot, descendants, article/list/chat/space metadata, user agent, app attestation, pasted flag, composition source, safety labels (`grox/core/data_loaders/data_types.py:672-700`, `Post`). Mapping from thrift uses `post_metadata.text`, `language.language`, author metadata, URLs and metadata; it does not independently detect language (`Post.from_post_metadata`, `grox/core/data_loaders/data_types.py:749-851`). Thread loading appends a missing root and reverses ancestors (`Post.from_content_understanding_metadata`, `grox/core/data_loaders/data_types.py:879-897`).

| Representation | Included / transformation | Important limit |
|---|---|---|
| Full `PostRenderer.render` | Handle/name; optional follower count/bio; own media + `url_videos`; full text, post ID, explicit URLs, broadcast, cards V2, shared Grok messages, article/list/chat/space metadata, quoted post recursively, descendants, screenshot. Removes one occurrence of each ancestor's handle from displayed text. Self-quote attribution is explicit. | Default `max_media=None`; when set, applies to combined media list, not a global budget for every card/quote. It does not fetch arbitrary web-page bodies. `grox/core/lm/post.py:28-138`. |
| `LitePostRenderer.render` | Removes `t.co` URLs from text; configurable author name/bio/signup-country/follower detail; creation time; media/descriptions/cards/quote; optional safety labels. | Different representation from full renderer; do not infer full-renderer fields from it. `grox/core/lm/post.py:141-205`. |
| `UserRenderer.render` | Default profile: name, username, bio, location. Optional stats include account creation, signup country, followers/following, subscription; optional profile URLs, affiliated business, recent posts. | Most classifier call sites use default flags; the existence of a user field does not prove every model sees it. `grox/core/lm/user.py:6-50`. |
| `ThreadRenderer.render` | Reply author profile, optional additional signals, root-to-reply thread. Signals: missing client events, TFE top country, account language, 24h reply count, followers, risky safety-label flag, 24h legitimate blocks, pasted reply. | At most 10 ancestors: first 5 + last 5 if longer. Two direct media items per post. Follower-count mode adds root bio. `grox/core/lm/thread.py:9-107`. |
| `Image.to_convo` | Standard image and optional dark-mode/light-mode/contrast-enhanced variants, each labeled | Only hydrated bytes are rendered. `grox/core/data_loaders/data_types.py:96-140`. |
| `Video.to_convo` | Hydrated `ConvoVideo` | No hydrated video means no video part. `grox/core/data_loaders/data_types.py:218-247`. |
| Card metadata | Legacy title/description/domain/thumbnail/poll choices; unified-card title/description/URL/image/video. Old `Card` has title/description/URL/domain/cover renderer. | Full post renderer iterates `cardsV2`, not `post.card`; older `Card` fields and `hasCard` bookkeeping must not be conflated with what that renderer consumes. `grox/core/data_loaders/data_types.py:250-490`; `grox/core/lm/post.py:82-87`. |
| Other native content | Shared Grok sender/message; broadcast thumbnail/video; list banner; chat-group name/avatar; Space title; article title, cover and attached media | `ArticleMetadata` has no article-body field; no Space audio transcription here. `grox/core/data_loaders/data_types.py:395-416,527-663`. |
| Domains | `_collect_urls` gathers post URLs, old card URL, unified-card URLs, user profile URLs; `extract_domains` lowercases hostnames, validates characters, deduplicates preserving insertion order | A helper's presence is not proof of ranking use. `grox/core/data_loaders/data_types.py:721-747`. |

Post language and account language are separate. The former is used by a specific English-language PTOS action gate; the latter can be rendered in reply signals and v8 embeddings. None of this establishes a blanket English boost or non-English penalty.

### Media hydration: actual budgets and data paths

**Code defaults**, subject to missing environment YAML: 4 media workers, 9 associated posts; ordinary main video 20 frames, non-main “light” video 2 frames; ordinary image/video tile size 448; deluxe threshold **64 likes**, deluxe video 30 frames, deluxe tile size 600; light/dark, CLAHE, motion reveal, local-broadcast extraction and preview-image flags all default false. `grox/config/config.py:103-120`, `MediaHydrationConfig`.

`MediaLoader.hydrate_post` prioritizes the target, then ancestors by descending likes, capped by `max_post_count`. High-favorite non-replies can fetch descendants; it retains them only if at least 3 hydrate. A high-favorite non-reply can receive a screenshot of the target when **either** its own direct media **or** its quote's direct media, evaluated separately, contains at least 2 images and no videos. One image on each does not satisfy that test; a video on the other post does not veto it. Descendant retrieval failures leave an empty list; screenshot failures are logged. `grox/core/data_loaders/media_loader.py:86-179`, `hydrate_post`, `ranked_posts_associated`.

| Media source / operation | Exact handling | Citation |
|---|---|---|
| Direct image | Download; resize to ordinary/deluxe size. Optional light/dark enhancement for main post; optional CLAHE for main high-favorite post. | `grox/core/data_loaders/media_loader.py:218-247,327-380`, `hydrate_media`, `hydrate_image` |
| Direct video | Known-duration videos allowed up to **360 minutes**; main high-favorite chooses highest bitrate estimated within **2 GiB**, otherwise `get_best_variant`. Despite the name, `get_best_variant` returns the **lowest positive bitrate**, then fallback first variant. Highest-within-budget falls back to that lowest variant if none fit. | `grox/core/data_loaders/media_loader.py:25-29,383-437`; `grox/core/data_loaders/data_types.py:178-215`, `VideoInfo` |
| Animated GIF | Highest bitrate for main high-favorite, lowest positive otherwise; treated as video frames. ASR skips animated GIFs. | `grox/core/data_loaders/media_loader.py:423-436`; `grox/core/tasks/task_asr.py:22-33,58-70` |
| URL video | Only main high-favorite posts; scans post URL path suffix `.mp4`, `.mov`, `.webm`, ignores direct-media URLs already present, up to **7**. Per-URL hydration errors logged and swallowed. | `grox/core/data_loaders/media_loader.py:25-29,182-215,314-324` |
| Card/poll media | Legacy thumbnail and poll images use ordinary sizing; unified-card images ordinary, videos main-post status but not high-favorite. Legacy branch is `if`, unified branch `elif`. | `grox/core/data_loaders/media_loader.py:261-290` |
| Article/list/chat media | Article attachments/cover, list banner, chat avatar hydrate only in high-favorite path, with ordinary sizing. | `grox/core/data_loaders/media_loader.py:291-313` |
| Quoted media | Recursively hydrated with same `is_main_post` and high-favorite flags passed from owner | `grox/core/data_loaders/media_loader.py:323-324` |
| Broadcast | Hydrates thumbnail; local frame extraction when enabled, otherwise external grox-fetcher with `dedup_video_frames=False`. Failures are logged and swallowed. Local extraction respects crop seconds. | `grox/core/data_loaders/media_loader.py:258-260,520-600` |
| Download | Two attempts with 1-second wait; video retries rewritten blobstore URL only when initial result is empty; subtitles queried by media ID, subtitle failure is nonfatal. Ordinary download exceptions can fail task. | `grox/core/data_loaders/media_loader.py:59-75,442-484` |
| Video preview | Disabled by default; only when hydrated video, preview URL, videoInfo and duration **>30 s** exist; preview decode/download error nonfatal | `grox/core/data_loaders/media_loader.py:485-518` |

**Frame sampling is not exact uniform coverage.** `VideoFramesExtractor._sample_frames` returns empty for nonpositive duration/budget; budgets 1/2/3 produce `[0]`, `[0,d/2]`, `[0,d/2,d]`. Otherwise sample count is `max(min(max_frames, ceil(duration)+1), 3)`, beginning at zero, with random jitter in subsequent time buckets and near the end. Crop seconds clamp the duration. Motion reveal can densely sample **48** frames separately; its imported builder is external to this file. `grox/libs/video_tools/video_frames.py:64-155`. Rendered phrases such as “uniformly sampled frames” and approximate timestamps do not override that extractor implementation.

`construct_convo_video` aligns subtitles to actual sample times, but stores a **single average interval** `(last-first)/(n-1)` rather than every timestamp; later renderers compute `i*interval`. It retains total sampled duration and optional motion-reveal frames. `grox/core/data_loaders/media_loader.py:613-689`.

### Model transport differs

| Transport | Video representation | Source |
|---|---|---|
| Grok interleaved / EAPI | Storyboard panels, **3 columns × up to 3 rows** each, frames in row-major order, interval-derived timestamp labels, subtitles, optional preview and motion-reveal stills. EAPI sends JPEG data URIs with `detail="high"`. | `grox/core/lm/convo.py:19-20,87-187,212-282` |
| OpenAI-compatible / Gemma | Each sampled frame as a separate image with interval-derived time/subtitle text, plus duration, preview, motion-reveal images. | `grox/core/lm/convo.py:348-427`, `Conversation.to_openai_messages` |
| Embeddings | Version-specific raw image/frame list plus text and image-pad markers, not the safety storyboard representation | `grox/flows/mm_emb/renderer.py:14-195`; `grox/flows/mm_emb/renderer_v82.py:140-184`; `grox/flows/mm_emb/renderer_v8_search.py:155-224` |

General safety conversation conversion renders subtitles but does **not** append `asr_transcript` from `ConvoVideo`; embedding renderers explicitly consume ASR. UPA and standard PTOS plans do not include `TaskASRTranscription`. This is a material difference between “audio understood by an embedding flow” and “audio transcribed for every safety classifier.” Sources: `grox/core/lm/convo.py:128-187,383-417`; UPA plans `grox/flows/upa/plan_initial_banger.py:15-33`, `grox/flows/upa/plan_post_safety.py:15-33`; PTOS plan `grox/flows/ptos/plan_safety_ptos.py:26-55`.

### ASR

`TaskASRTranscription` iterates **own `post.media` videos**, not recursively quoted/card/URL/broadcast videos; skips missing media/URL and GIFs; uses cached media-ID transcript if present (including an empty string). It only attaches transcript to an existing `convo_video`. Successful nonempty and no-speech empty transcripts are written to Strato; cache fetch/write errors are nonfatal. Input errors include `no_audio_stream`, `ffmpeg_timeout`, `ffmpeg_error:*`; other reported errors are logged and the task continues. `grox/core/tasks/task_asr.py:36-151`.

Audio extraction is FFmpeg mono PCM s16le **16 kHz**, 180-second subprocess timeout; config defaults cap audio at **600 seconds**, 8,192 output tokens, 300-second ASR HTTP timeout, temperature 0, workers 0. The endpoint is unset by default; deployment config is necessary. Output strips `<asr_text>` wrappers. `grox/core/data_loaders/asr_processor.py:39-86,101-181`; `grox/config/config.py:168-176`.

## UPA: descriptions, tags, topics, and boolean metadata

### Complete visible output schema

| Field | Type / processing | Meaning limits |
|---|---|---|
| `description` → `summary` → persisted `description` | Required string | Generated description; exact summary instruction absent |
| `tags` | Required list of strings; persisted as `{tag, score: 0.0}` | Tag score is a constant, not inferred confidence |
| `taxonomy_categories` | Optional list of dicts with names/scores resolved to external entity IDs | Full topic list is fetched, not embedded in source |
| `tweet_bool_metadata` | Optional `TweetBoolMetadata`: `isHighQuality`, `isNsfw`, `isGore`, `isViolent`, `isSpam`, `isSoftNsfw`, `isAdult`, each optional boolean | Model booleans, not interchangeable policy labels |
| `is_image_editable_by_grok` | Optional bool | Tool/editability annotation, not demonstrated recommendation eligibility |
| `slop_score` | Optional integer | Scale/rubric not enforced here or disclosed |
| `has_minor_score` | Optional float | Scale/rubric not disclosed |

Schema and parser: `grox/flows/upa/classifier_banger_initial_screen_gemma.py:44-51,106-154`, `BangerInitialScreenParsedOutput`; booleans: `grox/flows/upa/models.py:13-20`; persistence: `grox/flows/upa/task_write.py:146-193`, `TaskPublishUnifiedPostAnnotationsManhattan`.

**Taxonomy mechanics:** `TaskBangerScreen` fetches `StratoGrokTopics`, caches for **3,600 seconds**; a failed/empty refresh leaves the old cache intact. Name lookup includes category and subtopic names, stripped and casefolded. No topics means returned taxonomy entries are dropped; an unknown returned name raises `ValueError`. Writer validates IDs again, resolves parent category IDs and keeps the **maximum score per topic ID**. Entities use **domain ID 236** for topic and category. No disclosed local confidence threshold or “best niche” whitelist. `grox/flows/upa/task_banger_screen.py:17-76`; `grox/flows/upa/classifier_banger_initial_screen_gemma.py:27-41,121-144`; `grox/flows/upa/task_write.py:91-162`.

Writer bookkeeping is significant: **`qualityScore=1.0`**, **`originalOcrText=""`**, tag scores 0.0, media counts/hasImage/hasVideo from direct `post.media`, `hasCard` from old `post.card`, distinct cardV2 count. Do not call `qualityScore` a learned quality prediction, infer that blank OCR proves images cannot be read by a VLM, or assume direct media counts include everything the full renderer saw. `grox/flows/upa/task_write.py:164-190`.

Initial and deluxe UPA filters require author, reject replies (`post.ancestors`) and protected accounts; no topic/language filter there. Both flows dedupe locally for 60 seconds. Initial screen uses `oai-gemma4-26b-upa`; deluxe uses `GROK_4_1_FAST_HEDGEHOG_CRITICAL`, parsing `<json>…</json>`. Deluxe result contains only required boolean metadata and upserts that metadata. `grox/flows/upa/task_filter.py:12-87`; `grox/flows/upa/task_rate_limit.py:6-13`; `grox/flows/upa/constants.py:11`; `grox/flows/upa/classifier_post_safety_screen_deluxe.py:19-75`; `grox/flows/upa/task_write.py:196-243`.

After screening, UPA persistence and actioning are **parallel DAG branches**, not an atomic transaction. `TaskGrokUpaActionWithLabels` prefers initial-screen boolean metadata, otherwise deluxe's, then calls external `StratoGrokUpaActionWithLabels.execute` and logs returned labels. Its exact mapping lives outside these audited files; do not invent it from boolean names. Production-only write/action guards are explicit. `grox/flows/upa/plan_initial_banger.py:24-33`; `grox/flows/upa/plan_post_safety.py:24-33`; `grox/flows/upa/task_grok_upa_action_with_labels.py:16-63`.

## PTOS: safety taxonomy, routing, cross-validation, and actions

### Complete visible category and policy taxonomy

`SafetyPolicyCategory` includes **10 categories**. `SafetyPolicyType` below is the complete visible enum, including **35 values total** (one `NoViolation` plus 34 policy types). Names are exact code identifiers, **not definitions of the omitted policy prompt**. Source: `grox/flows/ptos/state.py:11-71`.

| Category / family | Policy enum values |
|---|---|
| All | `NoViolation` |
| `ViolentMedia` | `ViolentMediaGraphicMedia`, `ViolentMediaGore`, `ViolentMediaWithException`, `ViolentMediaViolentSexualConduct`, `ViolentMediaBestialityAndNecrophilia` |
| `AdultContent` | `AdultContentSexualHard`, `AdultContentSexualSoft` |
| `Spam` | `SpamEngagementFarming`, `SpamEngagementTrading`, `SpamFinancialScam`, `SpamHashTagAbuse`, `SpamScamLinks`, `SpamBotProduced`, `SpamPlatformManipulation`, `SpamEngagementBaiting`, `SpamCardManipulation`, `SpamMentionAbuse`, `SpamManipulatedMedia` |
| `IllegalAndRegulatedBehaviors` | `IllegalAndRegulatedBehaviorsSexualServices`, `IllegalAndRegulatedBehaviorsIllegalDrugs` |
| `HateOrAbuse` | `HateOrAbuseSlursWithTarget`, `HateOrAbuseInsultsWithTarget` |
| `ViolentSpeech` | `ViolentSpeechMajorAndSpecificThreatWithHumanTarget`, `ViolentSpeechMajorAndNonSpecificThreatWithHumanTarget`, `ViolentSpeechMajorAndSpecificThreatWithoutHumanTarget`, `ViolentSpeechMajorAndNonSpecificThreatWithoutHumanTarget`, `ViolentSpeechMinorWithHumanTarget`, `ViolentSpeechMinorWithoutHumanTarget` |
| `SuicideOrSelfHarm` | `SuicideOrSelfHarmEncouraging`, `SuicideOrSelfHarmDepiction`, `SuicideOrSelfHarmEngaging`, `SuicideOrSelfHarmExpressingDesire` |
| `ChildSafety` | `ChildSafetySexualAbuseMaterial`, `ChildSafetySexualExploitation` |
| `TerrorismOrViolentExtremism`, `CivicIntegrity` | Categories exist, but no corresponding policy types or generic policy-classifier branches in this snapshot |

The schema does not mechanically constrain every enum type to its matching category. `SafetyPtosViolatedPolicy` has category, optional integer score, reason, optional `SafetyPolicy`; the latter contains enum, optional integer `confidenceScore`, optional reason. There is **no 0–100 bound** in these Pydantic field declarations and no generic confidence threshold in the sink. Some synthetic paths use 50 or rounded confidence×100; that does not establish calibration of all model scores. `grox/flows/ptos/state.py:74-94`; `grox/flows/ptos/task_safety_ptos_policy.py:146-150`; `grox/flows/ptos/task_write_safety_post_annotations_result_sink.py:405-420`.

### Standard plan and model routes

`PlanSafetyPtos`: author filter → rate-limit/dedupe → media hydration → category detection → policy detection → safemodel sex/nudity → adult cross-validation → result sink. Both minimum-traction and minimum-impression streams use this plan, as do recovery/deluxe/backfill types with different modes. `grox/flows/ptos/plan_safety_ptos.py:23-55`; `grox/flows/ptos/generators.py:43-94`.

| Mode / stage | Primary route in code | Fallback / qualification |
|---|---|---|
| Standard, recovery, live-anchor category | Gemma `oai-gemma4-26b`, category dial **1.0** | On Gemma exception: standard/live `critical-safety`, recovery `grok-4-1-fast-hedgehog` |
| Deluxe category | `grok-4-1-fast-hedgehog-critical` | Reasoning restrictions stripped |
| Backfill category | `grok-x-algo-extra` | No Gemma category route |
| Standard/live generic policy | `grok-4-1-fast-hedgehog-critical` | Spam and illegal/regulated categories route to Gemma first |
| Recovery generic policy | `grok-4-1-fast-hedgehog` | Spam and illegal/regulated categories route to Gemma first |
| Backfill generic policy | `grok-4-1-fast-x-algo-extra` | Same category-specific Gemma rule in `_sample` |
| Deluxe adult/violent-media policy, **128–1,023 likes** | EAPI `eapi-grok-4-3-x-algo` | Circuit/open or sample failure → configured 4.1 VLM |
| Deluxe adult/violent-media policy, **≥1,024 likes** | EAPI `eapi-grok-4-6-internal` | Circuit/open or sample failure → configured 4.1 VLM |
| Child-safety policy | Gemma, with post creation date (or current date fallback) in template | Sample/parse failure → `NoViolation`; positive result cross-checked by 4.5 |
| Realtime mention-spam flow | `SafetyPtosPolicyClassifier` with `oai-gemma4-26b-ptos-realtime` | Direct Spam category, VLM fallback `grok-4-1-fast-hedgehog-critical` |

Route citations: `grox/flows/ptos/task_safety_ptos_category.py:15-40`; `grox/flows/ptos/classifier.py:119-121,170-182,406-469,567-723`; `grox/flows/ptos/task_safety_ptos_policy.py:28-65`; `grox/flows/ptos/task_ptos_spam_detection.py:22-58`; model-key strings `grox/config/config.py:79-93`, `grox/flows/ptos/constants.py:22-25`.

**Implementation subtlety:** generic policy `_sample` checks `sample_for_gemma`, based on category membership, and does **not** consult stored `self.use_gemma`; therefore a constructor's `use_gemma=False` alone is not proof that Spam/IllegalAndRegulatedBehaviors avoid Gemma. `grox/flows/ptos/classifier.py:479-490,587-590,628-629,711-723`.

Violent speech and self-harm always enable reasoning; on replies they use `ThreadRenderer`. Live-cluster spam policy omits the separate user profile block, although `PostRenderer` still includes author handle/name. Unsupported categories return `None`. `grox/flows/ptos/classifier.py:528-609`.

Deluxe with **≥128 likes**, rendered media, no AdultContent category, and no prior NSFW flag gets an extra adult-policy check, synthetic category score 50; append only if not `NoViolation`. Prior NSFW on an existing AdultContent suspicion directly creates `AdultContentSexualHard` rather than resampling. `grox/flows/ptos/task_safety_ptos_policy.py:81-161`. The prior-NSFW lookup is per-task memoized; lookup error means “not previously flagged,” not “clean.” `grox/flows/ptos/prior_nsfw.py:16-34`.

### Cross-model confirmation and failure outcomes

| Path | Confirmation rule | Error/disagreement behavior |
|---|---|---|
| Child safety | Grok 4.5 must return exactly the same policy type | Any mismatch, unparseable output, call failure → `NoViolation` |
| Illegal/regulated | Grok 4.1 fast x-algo must return same policy type | Mismatch/unparseable/error → `NoViolation`; agreement can substitute confirmation reason |
| Violent media | Grok 4.5 exact match keeps primary | Confirmation `NoViolation` → no violation; another type, parse failure or error → `ViolentMediaGraphicMedia`, preserving primary confidence |
| Adult PTOS vs safemodel | Compare hard-adult boolean with safemodel positive; invoke 4.5 only for deluxe-tier disagreement, unless prior NSFW | Judge hard keeps original; **every non-hard judge result becomes Soft**, and clears safemodel positive. Judge error keeps original in ordinary deluxe, but special-video/leading-frame flows become Soft. |

Sources: `grox/flows/ptos/classifier.py:234-403`; `grox/flows/ptos/task_safety_ptos_adult_content_cross_validation.py:40-148`. Do not summarize all of these as “fails open,” “fails closed,” or “majority vote”: behaviors differ.

EAPI breakers: failure-rate threshold **0.5**, minimum **10** calls, recovery **600 s**, half-open maximum **5**, cancellation excluded. Window is **120 s** for 4.3, **600 s** for 4.5 and 4.6. `grox/flows/ptos/classifier.py:69-101`. The 4.5 cross-validation error handling above still applies when its breaker is open.

### Safemodel sex-and-nudity details

The fixed request selects `sex-and-nudity`, version `0`, checkpoint `gs://safetool-classifier-assets-prod/classifiers/sex-and-nudity/train_jobs/20b742f8/checkpoint.pt`. The checkpoint itself is not supplied. Non-deluxe only runs if category-stage suspicion includes AdultContent; deluxe runs without that suspicion but skips prior NSFW. It takes own/quoted **direct** images and up to **8 frames per video**, **12 payloads total**. Locally extracted own/quoted broadcasts may be added afterward if that config flag is enabled. It does not iterate cards, URL videos, articles, or motion-reveal stills in this collector. `grox/flows/ptos/task_safety_ptos_safemodel_sex_nudity.py:22-33,63-84,143-192`.

Sampling picks indices `int(i*n/k)` if there are more than k frames. Payload calls run concurrently via `asyncio.to_thread`; each HTTP call timeout 5 s, up to 3 attempts, whole task timeout 15 s. Any failed payload means **do not mark the post scored**, even if another payload was positive. If all succeeded, any bucket `R` or `X` is positive; confidence is maximum among positive predictions, **not gated by a confidence threshold**. Missing/unparseable confidence becomes 0; missing prediction is an error. `grox/flows/ptos/task_safety_ptos_safemodel_sex_nudity.py:36-50,86-141,187-270`.

### Actual PTOS actions and annotation semantics

All mappings here are in `TaskWriteSafetyPostAnnotationsResultSink`; external action implementations and downstream visibility treatment require separate tracing.

| Condition | Visible label/action |
|---|---|
| Test user | Apply only `PtosReviewed`, return |
| ViolentMedia policy other than `NoViolation`, and **rendered media present** | `GoreAndViolenceHighPrecision` |
| AdultContent `AdultContentSexualHard` | `NsfwHighRecall`; also `NsfwHighPrecision` if rendered media present |
| AdultContent `AdultContentSexualSoft` | `SoftNsfw` |
| Spam `SpamEngagementBaiting`, `SpamEngagementFarming`, `SpamCardManipulation` | `SpamHighRecall`, including high-PageRank/grey-badge users |
| Other non-NoViolation Spam | `SpamHighRecall` unless high-PageRank-v2 **or** grey badge |
| Non-NoViolation IllegalAndRegulatedBehaviors | `SpamHighRecall` unless high-PageRank-v2 or grey badge |
| `HateOrAbuseInsultsWithTarget` | `FosnrAbuseInsults` only if **post.language == "en"** and not high-PageRank/grey badge |
| `SuicideOrSelfHarmEncouraging` or `…Depiction` | Bounce-post action unless high-PageRank/grey badge |
| `SuicideOrSelfHarmExpressingDesire` | Send-support-messages action |
| `ChildSafetySexualExploitation` | Suspend-user action unless high-PageRank/grey badge |
| End of ordinary action loop | `PtosReviewed` |

Source: `grox/flows/ptos/task_write_safety_post_annotations_result_sink.py:162-314`, `_apply_labels_for_annotation`. Other enum values, e.g. slurs, violent speech, child sexual-abuse-material, do not gain an action merely because their names exist. This is not a claim that no other repository system handles them.

Boolean summary uses non-NoViolation ViolentMedia → `isGore`; hard adult → `isNsfw`; soft adult → `isSoftNsfw`; non-NoViolation Spam **or IllegalAndRegulatedBehaviors** → `isSpam`. It can differ from labels because some actions have media/language/author exemptions. Existing booleans merge with new values by **OR**, while a timestamped new annotation is appended to prior annotations. Violation score sorting is merely descending annotation order. Positive safemodel can append a synthetic hard-adult annotation (`identifier="safemodel-sex-nudity"`) and run label application if PTOS itself was not hard-adult. A separate external `grokPtosDeleteLabels` call receives the final result, then Manhattan write and Kafka insert occur. Consequently, OR-merged annotations do not prove permanent immutable label state. `grox/flows/ptos/task_write_safety_post_annotations_result_sink.py:65-159,317-492`.

### Specialized PTOS flows

| Flow | Eligibility / context | Result |
|---|---|---|
| Realtime with signals | Author; at least **2 whitespace-delimited tokens starting `@`**; skip high-PageRank/grey badge; sleep **10 s**, then skip existing `SpamHighRecall` | Direct Spam policy → normal sink; this is not all-post realtime inspection. `grox/flows/ptos/task_filter.py:37-86`; `grox/flows/ptos/task_ptos_spam_detection.py:22-58`. |
| Special video | Own or quoted direct `Video`; likes ≥ configured deluxe threshold; after hydration `TaskSpecialVideoScreen` requires nonempty motion-reveal frames | Runs special-video safety flow; enabled enhancements and actual frames matter. `grox/flows/ptos/task_safety_ptos_special_video_filter.py:13-40`; `grox/flows/ptos/task_special_video_screen.py:13-49`. |
| Adult leading frames | Author; direct own/quoted video **≥30 s** or broadcast; prior PTOS result required, prior `isNsfw` false; requires prior AdultContent suspicion **or ≥512 likes** | Sets crop to first **10 s** before hydration; does not establish all videos only receive first-10-second analysis. `grox/flows/ptos/task_safety_ptos_adult_content_leading_frames_filter.py:24-83`; `grox/flows/ptos/constants.py:29-33`. |
| Media-injected infrared spam | Own/quoted direct video; likes ≥ configured deluxe threshold; not prior NSFW; at least one hydrated video | Grok 4.1 critical compares external reference storyboards with post (descendants omitted); reasoning at **≥512 likes**; positive → **Spam / SpamManipulatedMedia**, not an adult-hard label. Missing bundle raises before task's error catch; timeout/parse/sample error otherwise logged, no invented positive verdict. `grox/flows/ptos/task_safety_ptos_media_injected_adult_infrared_video_spam_detection_filter.py:19-47`; `grox/flows/ptos/task_safety_ptos_media_injected_adult_infrared_video_spam_detection.py:46-189`. |
| Live cluster anchors | Proto input requires nonzero `anchorPostId` and `clusterId`; post ID must match anchor input | `enforceDecision=true` only for Spam with non-NoViolation policy; append verdict history to Manhattan, publish compact JSON anchor/cluster/decision/time to Kafka. No generic direct PTOS label sink implied. `grox/flows/ptos/state.py:97-121`; `grox/flows/ptos/task_write_live_cluster_anchor_verdict_sink.py:35-103,106-175`. |

Reference bundles are external blobstore manifests: max **10 videos ×10 frames**, each required object (including manifest through shared helper) ≤**2 MiB**; default refresh **900 s**, 15-second fetch timeout, 60-second retry interval while empty. A failed refresh retains prior bundle. Version and SHA-256-derived 12-character digest identify loaded content, but reference examples themselves are absent. `grox/core/data_loaders/media_reference_bundle.py:15-32,55-146`; `grox/config/config.py:202-206`.

## Reply quality and spam

These flows concern reply annotation and safety actioning. A stored reply score is not itself the final For You post score.

| Flow | Scope and model route | Source |
|---|---|---|
| Simple spam | Reply with valid author/parent/root; skip Grok/Gork authors, self-reply-to-parent and self-reply-to-root. Parent/root max follower count **≤200,000** | `grox/flows/reply_spam/task_filter.py:17-94`; `grox/flows/reply_spam/constants.py:5-8` |
| Reply ranking | Reply with valid author/parent/root; parent or root **>200,000** followers; skip self-parent/root replies | `grox/flows/reply_spam/task_filter.py:185-249` |
| Simple scorer model | `oai-gemma4-26b-2`; use `oai-gemma4-26b-reply-spam` when max(root,parent) followers **>150,000**. A reply containing a quote delegates to full `ReplyScorer`. | `grox/flows/reply_spam/classifier_simple_reply_scorer.py:25-71`; `grox/flows/reply_spam/constants.py:5-8` |
| Full scorer model | `GROK_4_MINI_CRITICAL`; if output lacks a braced object containing `score`, use `GROK_4_1_FAST_HEDGEHOG_CRITICAL` with nonreasoning wrapper | `grox/flows/reply_spam/classifier_reply_ranking.py:30-94` |
| Coordinated spam | At least 2 ancestors, root **≥80,000** followers, valid author/parent/root, author not root/Grok/Gork, not high-PageRank/grey badge | `grox/flows/reply_spam/task_filter.py:97-182` |
| Multi-step reply spam | At least 2 ancestors, no deleted ancestor, root **≥1,000** followers; current author equals parent but not root; Grok/Gork/high-PageRank/grey-badge exemptions | `grox/flows/reply_spam/task_multi_step_reply_spam.py:25-124` |

Both scorers' float scores must lie within **0–3**, but need not be integers. Parsers try JSON, JSON repair, then regex extraction; invalid/out-of-range throws. Both include extra signals and follower counts in `ThreadRenderer`; the 100,000 prompt parameter is separate from the 150,000 model split and 200,000 flow split. `grox/flows/reply_spam/classifier_reply_ranking.py:55-78,109-172`; `grox/flows/reply_spam/classifier_simple_reply_scorer.py:46-54,87-150`.

`TaskWriteReplyRankingManhattan` only writes a new score if **strictly lower** than an existing nonmissing score; same/higher returns before label application. Score **0.0** calls `_apply_reply_spam_label`, which skips missing author, high-PageRank/grey badge, test user, otherwise applies **`RiskyHighVizReply`**. The score is still persisted after an exempt label helper returns. Reasoning is truncated to its **last 500 characters**. `grox/flows/reply_spam/task_write.py:36-143`.

Publishing is sequential across storage stages: for a nonmissing score **≤1.0**, first await parallel writes to the ATLA/PDXA score caches; then insert the Kafka score record; then write the main Strato score. Higher scores bypass the regional cache fanout. No local catch in this method makes those stages atomic or guarantees later writes after an earlier failure; regional TTLs are external. `grox/flows/reply_spam/strato_loader.py:20-53`, `ReplyRankingScoreStratoLoader.publish_reply_ranking_score`.

Coordinated and multi-step scorers use `oai-gemma4-26b-2`, indexed threads, max 2 direct media per post. Outputs prefer `spam_post_indexes`, accept `spam_post_ids`, normalize singleton values to lists, and only resolve valid non-root indexes or actual candidate IDs; deduplicate results. Coordinated renders all supplied ancestors, while multi-step caps to first/last 5. Neither accepts an arbitrary hallucinated ID as an action target. `grox/flows/reply_spam/classifier_coordinated_spam.py:21-29,103-137,153-222`; `grox/flows/reply_spam/classifier_multi_step_reply_spam.py:21-30,90-142,157-226`.

Guard rules after inference:

- **Both:** drop all flags if newest reply not included; drop a singleton result.
- **Coordinated:** veto flags if root author previously replied to the newest reply's author, inferred from adjacent thread pairs.
- **Multi-step:** remove posts not authored by newest reply author before singleton check.

Sources: `grox/flows/reply_spam/classifier_coordinated_spam.py:31-101`; `grox/flows/reply_spam/classifier_multi_step_reply_spam.py:32-88` under `grox/flows/reply_spam/`. Writers visit supplied thread posts only, run same label helper, write **0.0** and last-500-character reason; these writers do not use the single-score writer's lower-only check. `grox/flows/reply_spam/task_write.py:146-194`; `grox/flows/reply_spam/task_multi_step_reply_spam.py:151-199`.

## Multimodal embeddings

### Versions are materially different

| Property | v5 (`v5_1`) | v8.2 (`v8_2`) | v8-search (`v8_search_1`) |
|---|---|---|---|
| Visible instruction | **“Represent this X post for retrieving relevant X posts by content, topic, sentiment, or interest groups”** | **“Represent this X post (formerly Twitter) for recommendation: capture its topic, intent, key entities, and likely engagement.”** | Same visible instruction as v8.2 |
| Model key | `recsys-v5-embedding` | `recsys-v82-mm-embedding` | `recsys-v8-search-embedding`; backfill uses `recsys-v8-search-backfill-embedding` |
| Output | First **1,024 dimensions** if longer, then L2-normalize; shorter vectors also normalized | L2-normalize full returned vector; no fixed local output dimension | L2-normalize full returned vector; no fixed local output dimension |
| Own/quoted text | Full text after `t.co` removal; explicit “Quoted post” section | Own text capped **4,000 chars**, quote **1,000**; removes trailing x/twitter photo/video status URL from own text | Same caps; sanitizes configured image-pad token from text; quoted attribution can exist even when quote text empty |
| Author context | Name and handle | Name/handle, bio ≤500, verification color/subscription, parody/commentary/fan label, protected marker, NSFW account marker, follower/following tiered counts, join month/year, signup country fallback TFE country, account language, affiliated business name | Essentially same author fields |
| Own images/video | All direct media subject to optional image budget; video frames reduced uniformly by index when budget constrained | **First usable direct medium only**: first image or up to 4 frames of first video | **Every usable direct medium**, up to 4 frames/video |
| Quoted media | Render quote separately; if a max budget is set, split it by number of posts | Append first usable quoted medium, then cap combined images/frames at **4**; own medium gets priority | Append quoted media after own; cap global image/frame budget at **16**, with labels distinguishing quoted vs own |
| Cards | Legacy/unified titles + descriptions, thumbnail/image/video; poll choices and images | First legacy card with title: **title ≤100 chars + cleaned domain** | Same limited legacy-card text path |
| Article | Title, cover image, attached media if hydrated | Title only, ≤200 chars | Title only, ≤200 chars |
| ASR | Own direct-video transcripts joined and appended without a renderer cap | Own direct-video transcripts joined, ≤2,000 chars | Transcript per collected own/quoted video record, total nominal 2,000-char budget divided across records when multiple; attached only where transcript exists |
| Explicit URL list / URL-video list | Not rendered as a separate field | Not rendered as a separate field | Not rendered as a separate field |
| Transport | ChatTemplate + `/encode` | Text/image object via `/v1/embeddings` | Text/image object via `/v1/embeddings` |

Evidence: `grox/flows/mm_emb/renderer.py:7-195`, `V5EmbedPostRenderer`; `grox/flows/mm_emb/embedder.py:14-86`; `grox/flows/mm_emb/renderer_v82.py:12-39,140-372`, `V82EmbedPostRenderer`; `grox/flows/mm_emb/embedder_v82.py:19-98`; `grox/flows/mm_emb/renderer_v8_search.py:13-40,155-461`, `V8SearchEmbedPostRenderer`; `grox/flows/mm_emb/embedder_v8_search.py:23-113`; `grox/flows/mm_emb/constants.py:17-26`.

For v8.2, `_collect_post_media` **returns at the first usable image/video**. Quoted frames may be appended under the own media label, and a quote-only image path can have an empty own label. A `quoted_core_user` is fetched/passed, but `_quoted_block` uses quote's `User` fields rather than that argument. These code details are more reliable than assuming parity with v8-search. `grox/flows/mm_emb/renderer_v82.py:156-164,285-314,340-372`; `grox/flows/mm_emb/embedder_v82.py:62-75`.

v8 video “quality” is a string derived from **highest listed bitrate**, not a vision quality classifier: ≥5,000,000 → `Full HD`, ≥1,500,000 → `HD`, otherwise `SD`, absent for nonpositive/missing bitrate. This may differ from the bitrate actually downloaded. Followers/following use tier boundaries 10,100,1K,10K,100K,1M,10M,100M; rendering a count/tier is not evidence of a direct boost coefficient. `grox/flows/mm_emb/renderer_v82.py:53-124,285-314`; `grox/flows/mm_emb/renderer_v8_search.py:68-139,330-378`.

The default v5 embedder supplies **no `max_images`**. Renderer supports per-post budget splitting and frame subsampling, but those optional API capabilities are not unconditional active constraints. It may stop card text traversal once a configured image budget is exhausted because budget checks occur before processing cards. `grox/flows/mm_emb/embedder.py:27-40,64-66`; `grox/flows/mm_emb/renderer.py:22-44,76-92,136-152`.

### Embedding RPC and publishing

`XaiEmbeddingClientHttp` defaults to semaphore 10,000 and `AsyncLimiter(10000)` (do not infer cluster-wide QPS), 120-second timeout unless supplied. Model config contains `text_max_len=1024`, but the shown encode and OpenAI paths do **not** use it to truncate text. v5/v8.2 fill absent timeout with 60 s; v8-search explicitly uses 60 s. Model identifiers/endpoints come from external Grox config. OpenAI request is `{"input":[{"text":...,"image": URI-or-list}],"model":...}`; output is `data[0].embedding` as float32. `/encode` sends rendered chat text, optional base64 images and `sampling_params.max_new_tokens=1`. `grox/libs/embed/embed_http.py:17-92,116-248`; embedding constructor citations above.

Each normal plan is dedupe → media hydration → ASR → embedding → sink. v5 also branches into the `v5-all` Kafka publisher. Empty embeddings stop downstream work. `grox/flows/mm_emb/plan_post_embedding_v5.py:15-37`; `grox/flows/mm_emb/plan_post_embedding_v82.py:15-32`; `grox/flows/mm_emb/plan_post_embedding_v8_search.py:15-34`; `grox/flows/mm_emb/task_multimodal_post_embedding.py:19-129`.

| Output path | Exact behavior | Source |
|---|---|---|
| Normal v5/v8.2/v8-search sinks | Write `TweetEmbedding(tweetId, embedding1)` to no-cache Strato/Manhattan key `(postId, version)`; publish normal Kafka only if `not post.ancestors` | `grox/flows/mm_emb/task_write_mm_embedding_sink.py:61-124,170-202` |
| Explicit reply variants | Reply eligibility requires ancestors, author, root/parent author and no protected root/parent/replier. Dedicated sinks can publish replies to Kafka. | `grox/flows/mm_emb/task_filter.py:10-50`; `grox/flows/mm_emb/task_write_mm_embedding_sink.py:37-58,127-148,205-230`; `plan_post_embedding_v5_for_reply.py`, `plan_post_embedding_v82_for_reply.py`, `plan_post_embedding_v8_search_for_reply.py` in same directory |
| v5-all | Publishes vector separately, including replies | `grox/flows/mm_emb/task_write_mm_embedding_sink.py:151-163`; `grox/flows/mm_emb/plan_post_embedding_v5.py:25,34-36` |
| v8-search backfill | Manhattan only, model version `v8_search_1` | `grox/flows/mm_emb/task_write_mm_embedding_sink.py:233-250` |
| Kafka payload | `SimpleTweetEmbedding(tweetId, embedding1)`, keyed by post ID; multi-region producer cached behind async lock | `grox/flows/mm_emb/task_embedding_pub.py:20-64` |

Normal topic names are `grox-multimodal-embedding-v5`, `grox-multimodal-embedding-v5-all`, `grox-multimodal-embedding-v8-2`, `grox-multimodal-embedding-v8-search`. They show publishing destinations, not which downstream candidate sources necessarily consume every vector. `grox/flows/mm_emb/constants.py:17-20`.

### Backfill selection is not a general posting rule

`KafkaMmBackfillRequestLoader` parses positive little-endian signed 64-bit IDs from payloads whose length is divisible by 8, batches by 100. Consumer dedup TTL defaults to **3 days**; batched favorite hydration uses up to **4 concurrent RPCs** by default; fanout defaults to **240**. `grox/flows/mm_emb/generators.py:65-104`; `grox/flows/mm_emb/backfill_consumer_dedup.py:9-31`; `grox/flows/mm_emb/batched_fav_hydrator.py:14-32`; `grox/flows/mm_emb/task_backfill_fanout.py:22-85`.

Backfill flow gates on known likes, starting minimum **20,000**, then checks for existing versioned embedding **before** loading full post. `AdaptiveMinFav` targets 5 pass-QPS (environment override), 30-second windows, 60-second warmup, gain 0.3, deadband 0.1, threshold clamped 0–20,000; observation happens after the existing-vector check. It adjusts threshold, not post rank. Sink is Manhattan-only. `grox/flows/mm_emb/task_backfill_gate.py:16-60`; `grox/flows/mm_emb/adaptive_min_fav.py:6-63`; `grox/flows/mm_emb/plan_post_embedding_v8_search_backfill.py:18-43`.

## Async lifecycle, caches, and failure semantics

### Sources and scheduling

| Family | Input routing present in code | Citation |
|---|---|---|
| UPA initial | Minimum-traction, recovery, priority streams → initial banger plan | `grox/flows/upa/generators.py:18-51`; names in `grox/flows/upa/constants.py:1-11` |
| UPA deluxe safety | Popular-post stream → post-safety plan | `grox/flows/upa/generators.py:36-42` |
| PTOS | Minimum-traction, minimum-impression, recovery, deluxe, backfill → main PTOS; delayed replication → realtime-signals; distinct live-anchor/special-video/leading-frame/media-injected streams | `grox/flows/ptos/generators.py:43-132`; names in `grox/flows/ptos/constants.py:1-49` |
| Embeddings | Requests-with-summary stream → separately registered v5/v8.2/v8-search plans; recovery routes for v5/v8.2; minimum-traction multimodal → dedicated reply plans; backfill batch stream → v8-search backfill | `grox/flows/mm_emb/generators.py:47-158`; `grox/flows/mm_emb/constants.py:1-26` |
| Replies | Unified-posts-v3 stream injects ranking, simple spam, coordinated spam and multi-step plans; recovery injects the same except coordinated spam | `grox/flows/reply_spam/generators.py:16-40`, `ReplyRankingTaskGenerator`, `ReplyRankingRecoveryTaskGenerator` |

A stream named “min traction,” “popular,” or “priority” does **not** expose its upstream producer's threshold in these files. A generator registration does not establish its configured traffic weight. `DispatcherConfig.task_generators` defaults to empty; environment YAML supplies actual selections/weights. `grox/config/config.py:145-158,240-257`.

`PlanMaster.exec` runs registered eligible plans concurrently; each plan has its own `TaskContext`, tasks wait on declared dependency futures. A `SKIPPED` dependency propagates skipping to downstream tasks. `TaskStopExecution` becomes `SKIPPED`, not an exception indicating content violation. Default task wrapper retries twice with 1-second wait, but many LLM tasks deliberately call `Task.exec.__wrapped__` to bypass that generic retry. Embedding sinks override with **3 attempts**, waits 1 then 2 seconds. `grox/core/plans/plan_master.py:10-42`; `grox/core/plans/plan.py:28-98`; `grox/core/tasks/task.py:17-59`; `grox/flows/mm_emb/task_write_mm_embedding_sink.py:26-34`.

Engine task timeout default **900 s**, dispatcher max in-flight **3**, graceful-shutdown defaults 120 s. Timeout becomes a failed result. Dispatcher acknowledges successful results; terminal failed results are also acknowledged when origin is known after `on_terminal_failure`, so do not assume automatic endless Kafka replay until classification succeeds. `grox/config/config.py:138-158`; `grox/core/engine.py:65-122`; `grox/core/dispatcher.py:127-164`.

An acknowledgement at the dispatcher is not itself proof of an offset commit: `KafkaLoader.ack` is a no-op; consumer commit behavior is in imported clients. `KafkaPostLoader` drops un-deserializable messages individually with a metric/log; the embedding loader additionally skips missing tweet IDs. Loader polling limits scale configured per-partition QPS by assigned partitions; prefetch errors are logged and retried after 0.1 seconds. `grox/core/data_loaders/kafka_loader.py:91-131,153-239`.

### Caches and dedupe

| Cache / state | Scope, default, behavior | Source |
|---|---|---|
| UPA initial/post-safety dedupe | Separate class-level `TTLCache(maxsize=10000, ttl=60)` keyed by post ID, marked on admission before downstream success | `grox/flows/upa/task_rate_limit.py:6-13`; `grox/core/tasks/task_rate_limit.py:44-59` |
| PTOS | Standard/deluxe separate 10K/60s caches; specialized leading-frame, infrared, realtime, live-anchor each own 10K/60s cache | `grox/flows/ptos/task_rate_limit.py:11-47` |
| Embedding versions / reply / backfill | Separate 10K/60s cache per declared rate-limit class | `grox/flows/mm_emb/task_rate_limit.py:6-38` |
| Coordinated spam | 10K/60s | `grox/flows/reply_spam/task_rate_limit.py:6-8` |
| Minimum-traffic PTOS distributed dedupe | For min-traction/min-impression only: read in-progress default cache, then direct-MH existing result; skip either; write stream name to **ATLA and PDXA** in-progress caches. TTL/atomicity of external store not present. | `grox/flows/ptos/task_safety_ptos_min_traction_dedupe_filter.py:21-65` |
| Grok topic taxonomy | Class-level cache, 1h; retains stale successful data on empty refresh | `grox/flows/upa/task_banger_screen.py:17-76` |
| ASR | Local `TTLCache(maxsize=1000, ttl=300)` and shared in-flight future keyed by `media_id or video_url`, plus Strato media-ID transcript store. Duration is not part of the local key. Empty success can be cached; reported errors are not successful transcripts. Strato TTL not shown. | `grox/core/data_loaders/asr_processor.py:280-350`; `grox/core/tasks/task_asr.py:75-151` |
| Prior NSFW | One memoized lookup per `SafetyPtosState`; failures treated as false | `grox/flows/ptos/prior_nsfw.py:16-34` |
| Reference bundle | Per-name locked state; stale-on-refresh-error; intervals and limits above | `grox/core/data_loaders/media_reference_bundle.py:93-146` |
| Backfill IDs | Dragonfly batch set-if-absent, `groxbf:<postId>`, default 3 days. Disabled client passes all; only an explicit `False` result drops a payload, while `None` error results pass and are counted. | `grox/flows/mm_emb/backfill_consumer_dedup.py:8-49`, `BackfillConsumerDedup.filter_first_seen` |

“Not annotated,” “missing media,” “classifier errored,” “deduped,” “not selected by source stream,” and “negative classification” are different states. This code provides no guaranteed wall-clock “new posts are fully understood after N seconds” SLA.

### Runtime configuration omissions

Grox reads `config/yaml/config.base.yaml` and environment-specific YAML, and raises if the variant is absent. Model dictionaries default empty, endpoint/model selection is external, prompt token strings default empty. Therefore Python defaults (e.g. 64-like deluxe threshold, frame budgets, temperature) are not verified production settings. `grox/config/config.py:25-37,55-93,192-269`. Grok sampler config defaults: context length 131,072, max response 8,092, temperature 0.7; OAI: timeout 300s, temperature 0.0001, max tokens 8,092; EAPI: timeout 300s, temperature 0.0001, search disabled, optional reasoning effort. `grox/libs/grok_sampler/config.py:4-34`.

## Media-model-proxy

This is an RPC proxy over selected external model services, not the modern Grox VLM pipeline.

### API and every registered model

Thrift `AnnotationRequest` takes `MediaEntity` + a set of `MediaModel`s. Entity can contain category, blobstore path, media ID, inline bytes, original blobstore path, broadcast ID. Controller uses inline bytes first, otherwise requires blobstore path. It asks each selected model in parallel and returns `AnnotationResponse(datarecord=empty map, annotations=Some(model→sequence))`. It does not expose an arbitrary HTTP URL fetcher here. `media-model-proxy/src/main/thrift/com/twitter/cortex_media_annotator/annotate.thrift:8-78`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/controllers/ProxyController.scala:33-79`.

| Thrift enum / descriptor | Input feature | Explicit outputs / validation | Service and timeout |
|---|---|---|---|
| `XX_NSFW` / `XXNsfwModelDescriptor` | Blob `media` encoding `CortexCore.Media(data=bytes)` plus required discrete `meta.media_type` | Continuous `nsfw.default.probability`, `.score`, `.precision`, `.recall`, `.fpr`; validator requires all five | `/s/xx-nsfw/xx-nsfw`, **8,000 ms**. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/XXNsfwModelDescriptor.scala:19-85` |
| `FINGERPRINTING` / `FingerprintingModelDescriptor` | UINT8 tensor `magicpony.media_fingerprinting.image` | FLOAT tensors `pixel_variance`, `embedding`, both required by validator | `/s/magicpony-fingerprinting/magicpony-fingerprinting`, **3,000 ms**. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/FingerprintingModelDescriptor.scala:21-69` |
| `FINGERPRINTING_V2` / `FingerprintingV2ModelDescriptor` | Same named tensor | Same explicit output keys, different availability flag | Same service/timeout; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/FingerprintingV2ModelDescriptor.scala:21-69` |
| `CATEGORY_CLASSIFICATION` / `CategoryClassificationModelDescriptor` | UINT8 `magicpony.category_classification.image` | No explicit subject-label taxonomy in descriptor | `/s/magicpony-category/magicpony-category-classification`, **3,000 ms**. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/CategoryClassificationModelDescriptor.scala:20-57` |
| `CATEGORY_CLASSIFICATION_EMBEDDINGS` / `CategoryClassificationEmbeddingsModelDescriptor` | UINT8 `media.data` | Real output is external `DataRecord`; alternate dummy vector is **256 floats**, feature ID **−1** | `/s/embeddings-category/embeddings-category-classification`, **4,000 ms**. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/CategoryClassificationEmbeddingsModelDescriptor.scala:21-68` |
| `HATEFUL_SYMBOL_RECOGNITION` / `HatefulSymbolRecognitionModelDescriptor` | UINT8 `magicpony.hateful_symbol_recognition.image` | No explicit symbol-class taxonomy in descriptor | `/s/magicpony-hateful/magicpony-hateful-symbol-recognition`, **3,000 ms**. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/HatefulSymbolRecognitionModelDescriptor.scala:20-52` |
| `VIOLENCE_AND_GORE` / `ViolenceAndGoreModelDescriptor` | UINT8 `violence_and_gore.image`, optional translated `meta.media_type` | No explicit severity/output-label taxonomy in descriptor | `/s/violence-and-gore/violence-and-gore`, **3,000 ms**. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/ViolenceAndGoreModelDescriptor.scala:25-74` |

The seven-descriptor registry is authoritative for supported requests: `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/ModelDescriptorRegistry.scala:9-19`. Thrift additionally contains `XX_NSFW_V2` and reserved entries without corresponding registry mappings. `Features.adultContent` and a `disable_adult_content_v1` flag exist, but **no AdultContent descriptor is registered in this map**. Do not silently fill that gap from the README's high-level description. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/config/Features.scala:17-27`; `media-model-proxy/src/main/thrift/com/twitter/cortex_media_annotator/annotate.thrift:8-29`.

Media category translation: explicitly supported category kept; otherwise GIF→TweetGif, video→TweetVideo, image→TweetImage, unsupported→exception. XXNSFW explicit set is TweetImage/TweetVideo/PeriscopeVideo/TweetGif and category is mandatory. ViolenceAndGore explicit set is AvatarImage/BannerImage/TweetImage/TweetVideo/TweetGif; absent category is allowed. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/ModelDescriptor.scala:19-45`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/XXNsfwModelDescriptor.scala:29-34,57-74`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/ViolenceAndGoreModelDescriptor.scala:35-61`.

These descriptors generally pass bytes through; they do not disclose every model's internal frame selection, OCR, audio handling, learned weights, class vocabulary, fingerprint distance threshold, or serving calibration table.

### Routing defaults, alternate results, and failures

- `media-model-proxy/config/decider.yml:5-35`: all listed model-disabling deciders default **0**; `Features` wraps them with `.disabling`. This means default enabled routes, not proof of current overrides.
- GIF support for category classification and category embeddings defaults **0**; descriptors specifically gate TweetGif and DmGif. Dummy embeddings and alternate dark traffic default **0**. Load shedding and Diffy traffic default **0**; request scribe availability **100/10000 = 1%**. `media-model-proxy/config/decider.yml:1-59`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/CategoryClassificationModelDescriptor.scala:30-33`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/CategoryClassificationEmbeddingsModelDescriptor.scala:33-36`.
- `SwitchingModelClient` chooses A/B with an alternate feature; optional dark traffic sends to the other without returning its result. It is **not an automatic error fallback**. Dummy implementation emits independent uniform random floats in a little-endian FLOAT tensor. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/clients/SwitchingModelClient.scala:11-29`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/clients/DummyEmbeddingsClient.scala:19-55`.
- `ModelsService.getPrediction` selects descriptor, builds input, filters availability, runs clients; unavailable routes yield an empty sequence. It collects per-client `Try`s and discards NoBrokers/nonfatal prediction errors, so a successful request can contain no results for a model. A special grayscale backend error is recognized. Unknown model or input-feature construction error can fail the request. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/services/ModelsService.scala:38-120`.
- Deepbird client uses Finagle idempotent extra-load tunable, per-request descriptor timeout, retries classified channel-closed/timeouts. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/clients/DeepbirdClient.scala:51-72`. Blobstore miss produces `MediaNotFoundException`. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/services/BlobStoreService.scala:18-30`.
- `ModelDescriptor.labels()` defaults empty and `validate` defaults no-op. The shown request-time `ModelsService` does not invoke `descriptor.validate`; do not treat explicit validator methods as per-request score-threshold enforcement. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/model_descriptors/ModelDescriptor.scala:25-29`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/services/ModelsService.scala:38-93`.
- **Staging startup validation:** `MediaModelProxyThriftServer.postInjectorStartup` runs `ModelClientValidator` only for `Env.Staging`. It requests every registered model using bundled `sample-image.jpg` as TweetImage, waits up to **60 seconds**, and validates each returned record. Empty result sequences have no records to validate, so this is not proof every backend is healthy or a production per-request check. `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/app/Server.scala:43-55`; `media-model-proxy/src/main/scala/com/twitter/media_understanding/model_proxy/app/ModelClientValidator.scala:19-44`.

## CLIP, adult-content, and pnsfwmedia training

### CLIP architecture and representation

`TwitterCLIP` lists pretrained RN50, RN101, RN50x4, RN50x16, ViT-B/32, ViT-B/16 and Twitter-specific `Twitter-ViT-B/32-256` / `Twitter-ViT-B/32-128`, both based on ViT-B/32. Default wrapper uses 256 dimensions and truncating text tokenization. URLs have been replaced with `example.invalid`; this is not a downloadable weight release. `clip/model.py:26-64,74-145`.

Image/text towers call underlying CLIP encoders, optionally add a feedforward projection: Linear→GeLU→dropout **0.1**→Linear→custom LayerNorm, default hidden dimension 1.5×input; configured output typically 256. Outputs normalized by L2 norm. Similarity logits use learned logit-scale exponent clamped at **100**. `clip/modules.py:6-81`; `clip/model.py:160-243`; `clip/utils/model_utils.py` for `create_logits`.

| Training/export aspect | Exact code behavior | Citation |
|---|---|---|
| Training samples | TFRecord `tweet_text` string + `image_byte_string`; training shuffle/repeat, decode/preprocess, ignore-errors, batch/prefetch | `clip/datasets/language_image_dataset.py:12-82` |
| Text cleanup | Removes newline/tab/CR sequences and `http\S+`, strips, collapses whitespace | `clip/utils/data_utils.py:44-53`, `clean_text` |
| Image preprocessing | Decode 3 channels, default 224 resolution; aspect-preserving resize/center crop in validation/default no-augmentation; augmentation random resize/crop; rank-4 decoded media drops to **first frame** | `clip/utils/data_utils.py:56-137,235-284`; `clip/config.py:10-13` |
| Normalization | Dataset/preprocessing helper defaults use `TWITTER_MEANS/STDEVS`; DBV2 export script explicitly supplies `PRETRAINED_MEANS/STDEVS` | `clip/utils/data_utils.py:14-18,56-60,84-89`; `clip/scripts/export_dbv2_image_model.py:29-40` |
| Loss | Average of image→text and text→image batch cross-entropies, target is matching batch index | `clip/training.py:143-171` |
| Optimizer | AdamW β=(0.9,0.98), epsilon 1e−6, weight decay .01, cosine scheduler with warmup | `clip/utils/train_utils.py:10-40` |
| Default config | Batch 128, LR 2e−5, 100,000 steps, 500 warmup steps, initial logit scale 4.5065, save every 5,000, last checkpoint only, mixed precision false, top feedforward true, final dimension 256 | `clip/config.py:5-35` |
| DBV2 image export | Torch→ONNX→TensorFlow wrapper, output key `embedding`, optional normalization and injectable `classification_heads` argument (default empty) | `clip/model.py:245-335` |
| Keras export | Separate image/text functions, normalized `image_embeddings`/`text_embeddings`; encoded-image preprocessing path; model-package cache checked for expected saved-model files, fetch latest only if absent | `clip/keras_model.py:12-72,75-155` |

Literal implementation caveats matter when reproducing: `clip_preproc_train` calls `tf.transpose(image,[2,0,1])` without assigning its return, unlike validation preprocessing; the code should not be rewritten in prose as guaranteed equivalent. Also “CLIP represents text/images” is not evidence that the media-only proxy requests include the post caption, or that every Grox embedding is this CLIP model. The modern Grox embedding clients are separate external services.

### CLIP dataset-selection evidence

The notebooks preserve construction recipes, cached-media processing and Dataflow examples, rather than a released corpus or a production deployment manifest. The SQL notebook supplies concrete language and sampling evidence:

| Selection step | Visible implementation |
|---|---|
| Example parameters | Date range **2021-01-01–2021-12-31**, impression threshold **50**, maximum **2,000 per hashtag**, **10,000,000** for the empty hashtag. These are notebook parameters, not modern recommendation thresholds. |
| Language / impressions | `language = "en"`; inner-join tweet IDs to daily-impression rows filtered by `impr >= imp_thresh` **before** summing by tweet. This is not simply a total-lifetime-impressions filter. |
| Hashtag sampling | Lowercase and normalize selected punctuation/diacritics, unnest hashtags, randomly rank per hashtag and apply the two caps. Deduplicate by `(tweet_id, media_url_https)` afterward; different media from one tweet can remain. |
| Public content / NSFW | Require nonprotected media and an author matching a nonprotected, nondeactivated user row in the date range. `media_nsfw` is selected as a field, **not filtered out** in the shown SQL. |
| Final ordering | Randomized row index and shuffle; no class-balanced content taxonomy or multilingual sampling specification follows from this recipe. |

Source: `clip/notebooks/create_bq_language_image_dataset.ipynb:24-33,64-164`, the parameter and `query` cells. This establishes an **English-only example dataset recipe**, not the language coverage of every CLIP checkpoint, modern Grox model, or For You audience.

### Adult-content binary head

`build_model`: BatchNormalization → Dense **128** units by default with GELU → Dense1 sigmoid. Adam learning rate .001, β1 .9, β2 .999, epsilon 1e−7, amsgrad false; binary cross-entropy; metrics PrecisionAtRecall(**0.9**, 200 thresholds) and PR AUC (200 thresholds). Input default **256-dimensional embedding**. Training defaults batch256, 100 epochs, 400 steps/epoch, repeat true, resample false; EarlyStopping monitors val_loss with patience5 and restores best weights. `adult-content/training.py:13-85`; `adult-content/config.py:5-28`.

Dataset uses TFRecord `media_embedding` float vector and scalar integer `labels`; positive is **label==1**, all others negative. Optional rejection resampling targets [0.5,0.5], seed0; files shuffled; training repeat path shuffles batch dataset with buffer10. No named positive-content subtypes or annotation guidelines supplied. `adult-content/dataset_utils.py:6-66`.

### Adult score calibration: what the numbers actually mean

`adult-content/calibration.py` contains a calibration procedure, **not released production calibration values**:

| Output column | Computation |
|---|---|
| `thresholds_adult` | Default 200 evenly spaced points 0–1; configurable count |
| `precision_at_thresholds_adult` | TP/(TP+FP), defined as 1 if denominator0 |
| `recall_at_thresholds_adult` | TP/(TP+FN), defined as 1 if denominator0 |
| `false_positive_rate_at_thresholds_adult` | FP/(FP+TN), defined as 1 if denominator0 |
| `probability_at_thresholds_adult` | Increasing isotonic regression, clipped 0–1, fitted to sorted predictions and within-bin positive ratios |

Threshold decision is `pred >= threshold`; ground truth is `label==1`. Positive-ratio bins use `[from_threshold,to_threshold)`, empty bin falls back to upper threshold; `get_interval` uses strict lower/upper surrounding thresholds. Calibration CSV is read as pred/label and writes `metrics_at_thresholds.csv`. Sources: `adult-content/calibration.py:12-97`; `adult-content/config.py:31-44`. Do not claim the procedure yields a particular precision/recall in deployment or that .5 is the serving action cutoff. Strict-neighbor interval and two-class confusion-matrix assumptions are visible implementation constraints for reproduction.

### pnsfwmedia experimental fusion model

The loaded `clip_model` is **frozen** (`trainable=False`) and called on the 256-dimensional feature `media.mediaunderstanding.media_embeddings.twitter_clip_as_tensor`. Its result is named `image_score`, but the loaded artifact architecture/output dimension is external. Concatenate it with:

1. `source_user.hss.user_health_scores.agatha_calibrated_nsfw_score`;
2. `source_user.hss.user_health_scores.nsfw_text_user_score`;
3. `log(source_user.core.socialgraph_counts.followed_by_count + 10)`;
4. `source_user.hss.user_health_scores.nsfw_consumer_follower_score`;
5. Three missingness indicators for those health scores being **−1**.

Then BatchNorm → Dense50 ReLU → Dense1 sigmoid. Health-score defaults −1; missing embedding defaults to 256 float64 zeros. `pnsfwmedia/model_experimental.py:17-92,108-133`.

Training uses optimized block-format `training.lzo` / `validation.lzo`, default batch32, epochs20, steps100, Adam, binary cross-entropy, AUC; exported serving signature decodes UINT8 batched prediction requests and writes a binary response. Saved model can output validation score/label CSV. Example data path ends `data_images_only`. Source: `pnsfwmedia/model_experimental.py:94-105,136-212`. No coefficients, training examples, outcome calibration, serving thresholds, or proof this experimental artifact is deployed everywhere are included.

## Composition/reach questions and evidence gaps

### Questions this reference can answer precisely

| Question | Evidence-based answer |
|---|---|
| “Does X understand my niche?” | UPA maps to an externally fetched category/subtopic taxonomy, emits freeform tags/description, and embedding instructions explicitly mention topic/intent/entities/interests. The actual taxonomy inventory and learned semantic coverage are not included. There is no supported list of automatically favored niches here. |
| “Can a picture or meme carry the meaning?” | Hydrated image bytes reach VLMs and image embeddings. Some safety paths also use screenshots and transformed images. Exact OCR accuracy or preference for text-in-image is not shown; blank persisted `originalOcrText` is not proof images are unreadable. |
| “Do link posts get penalized?” | Links/cards are represented differently by model version; PTOS has ScamLinks and CardManipulation policy names. Neither fact proves a blanket outbound-link penalty. Full web-page content scraping is not present in these renderers. Trace downstream rules for a claimed ranking effect. |
| “Does a quote change interpretation?” | Full VLM renderer explicitly embeds quote and self-quote attribution; all three embedding versions include quoted text/media in differing budgets. A simple reply containing a quote routes to the full scorer. These are representation/routing facts, not a quote-post boost. |
| “How much of a video is understood?” | Frames are sampled with budgets/jitter; subtitles are aligned; ASR for own direct videos is a separate embedding-plan step capped by config. Special flows inspect cropped leading frames or motion reveal. No guarantee every frame/audio segment is reviewed. |
| “Should I optimize the first four images/frames?” | v8.2 and v8-search differ; v8.2 returns first usable medium and caps 4 total, v8-search supports all direct media up to 16 images/frames. Safety rendering can see more/different content. No single universal four-image rule follows. |
| “Will early likes change analysis?” | Likes select richer hydration and certain expensive safety routes, and a separate backfill gate uses adaptive likes. These thresholds govern processing allocation, not a demonstrated ranking reward for crossing them. |
| “Can language/country/profile affect understanding?” | Some renderers include account language/country/bio/verification, and one PTOS insults action is English-only. Existence as model input does not disclose its learned weight or guarantee a reach effect. |
| “Is a high-quality/slop/NSFW boolean the final ranking score?” | No. UPA metadata, synthetic writer constants, PTOS verdicts, safety labels, reply scores, and embeddings have distinct producers/sinks. A consumer trace is required. |
| “Do hashtags, financial topics, AI-generated posts or repeated replies trigger classifiers?” | Named policy enums and reply context fields show those families can be evaluated; hidden prompts prevent reconstructing exact rubrics. Category names alone cannot determine an individual post verdict. |

### Explicit gaps and limits

- **Missing prompts:** exact policy/quality/slop/reply scoring rubrics and examples; no substitute prompt should be invented.
- **Missing runtime YAML/config and external services:** deployed models/endpoints, traffic weights, stream-producer thresholds, per-environment media settings, many Strato query implementations and datastore TTLs, external label-deletion/action semantics.
- **Missing learned assets:** model weights/checkpoints, real CLIP download endpoints, safemodel full bucket vocabulary, hateful-symbol/subject/violence taxonomies, fingerprint matching thresholds, production calibration CSVs, media-reference frames.
- **Missing end-to-end causality in this scope:** no measured reach deltas, format multipliers, guaranteed virality thresholds, comprehensive niche distribution policy, current traffic allocation, or public training corpus. Read downstream ranking/eligibility references and the full bundled source for consumers.
- **Snapshot-specific implementation details:** prose follows actual code rather than normalizing inconsistencies (e.g. frame labels vs jittered sampling, `use_gemma` stored but not consulted in policy sampling, synthetic `qualityScore`, old-card bookkeeping versus cardsV2 rendering).

Use the bundled `source/` for ancillary transport, loaders, integration tests, notebook cells, and exact imported interfaces. In answers, cite the producing symbol and the consuming symbol separately whenever making a claim about a label's or representation's effect on For You.
