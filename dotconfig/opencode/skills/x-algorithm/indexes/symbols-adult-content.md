# adult-content: source symbols

Mechanically extracted declarations. Search the bundled source for declarations not captured by this index.

- [`adult-content/calibration.py:12`](../source/adult-content/calibration.py#L12) — `class Metrics(object):`
- [`adult-content/calibration.py:13`](../source/adult-content/calibration.py#L13) — `def __init__(self, df, thresholds=None):`
- [`adult-content/calibration.py:22`](../source/adult-content/calibration.py#L22) — `def at_threshold(self, threshold):`
- [`adult-content/calibration.py:34`](../source/adult-content/calibration.py#L34) — `def at_all_thresholds(self):`
- [`adult-content/calibration.py:38`](../source/adult-content/calibration.py#L38) — `def pos_ratio_at_threshold(from_threshold, to_threshold, predictions_and_labels):`
- [`adult-content/calibration.py:49`](../source/adult-content/calibration.py#L49) — `def get_interval(score, thresholds):`
- [`adult-content/calibration.py:56`](../source/adult-content/calibration.py#L56) — `def pos_ratio_for_score(score, predictions_and_labels, thresholds):`
- [`adult-content/calibration.py:61`](../source/adult-content/calibration.py#L61) — `def fit_isotonic_regression(predictions_and_labels, thresholds):`
- [`adult-content/calibration.py:72`](../source/adult-content/calibration.py#L72) — `def calibrate_scores(calibration_ds, thresholds):`
- [`adult-content/calibration.py:91`](../source/adult-content/calibration.py#L91) — `def calibrate_and_write_scores(config):`
- [`adult-content/config.py:5`](../source/adult-content/config.py#L5) — `class TrainingConfig:`
- [`adult-content/config.py:8`](../source/adult-content/config.py#L8) — `def __init__(`
- [`adult-content/config.py:31`](../source/adult-content/config.py#L31) — `class CalibrationConfig:`
- [`adult-content/config.py:32`](../source/adult-content/config.py#L32) — `def __init__(`
- [`adult-content/dataset_utils.py:6`](../source/adult-content/dataset_utils.py#L6) — `def class_func(features, label):`
- [`adult-content/dataset_utils.py:15`](../source/adult-content/dataset_utils.py#L15) — `def decode_fn_embedding(example_proto, embedding_dim):`
- [`adult-content/dataset_utils.py:26`](../source/adult-content/dataset_utils.py#L26) — `def preprocess_embedding_example(`
- [`adult-content/dataset_utils.py:42`](../source/adult-content/dataset_utils.py#L42) — `def build_dataset(`
- [`adult-content/scripts/calibrate_model_scores.py:8`](../source/adult-content/scripts/calibrate_model_scores.py#L8) — `def get_argument_parser():`
- [`adult-content/scripts/calibrate_model_scores.py:18`](../source/adult-content/scripts/calibrate_model_scores.py#L18) — `def parse_args():`
- [`adult-content/scripts/calibrate_model_scores.py:23`](../source/adult-content/scripts/calibrate_model_scores.py#L23) — `def add_dataset_args(parser):`
- [`adult-content/scripts/calibrate_model_scores.py:32`](../source/adult-content/scripts/calibrate_model_scores.py#L32) — `def add_calibration_args(parser):`
- [`adult-content/scripts/train_model.py:8`](../source/adult-content/scripts/train_model.py#L8) — `def get_argument_parser():`
- [`adult-content/scripts/train_model.py:18`](../source/adult-content/scripts/train_model.py#L18) — `def parse_args():`
- [`adult-content/scripts/train_model.py:23`](../source/adult-content/scripts/train_model.py#L23) — `def add_dataset_args(parser):`
- [`adult-content/scripts/train_model.py:50`](../source/adult-content/scripts/train_model.py#L50) — `def add_training_args(parser):`
- [`adult-content/training.py:13`](../source/adult-content/training.py#L13) — `def build_model(embedding_length, dense_layer_units, learning_rate):`
- [`adult-content/training.py:45`](../source/adult-content/training.py#L45) — `def train_model(config):`
