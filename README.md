# AI-Based Abnormal Behavior Detection from Surveillance Cameras

This project is an FPT University capstone on automatic surveillance analysis for three safety-critical events: `fire`, `fall`, and `fighting`. It combines fast visual triggering with deeper event understanding, then exposes the result through a simple Flask dashboard for video upload, alert review, and processed output.

The implementation is based on the accompanying report in `AI_Based_Abnormal_Behavior_Detection_from_Surveillance.pdf`. The paper proposes a hybrid two-branch architecture, while the demo app in this repo packages the practical inference pipeline, training artifacts, and pretrained checkpoints.

## What the system does

- Detects people and fire-like regions from CCTV video
- Tracks detected persons across frames
- Uses YOLO pose keypoints to support action understanding
- Classifies human actions as `normal`, `fall`, or `fighting`
- Verifies fire detections with a lightweight CNN to reduce false alarms
- Exports processed video, JSON alerts, and dashboard-friendly outputs

## Architecture

### Branch 1: Human behavior analysis

- `YOLOv11` detects people and suspicious frames
- `YOLOv11 Pose` extracts 17 body keypoints
- `SlowFast R101 + Pose Encoder` classifies `normal`, `fall`, and `fighting`
- The current app applies smoothing and persistence logic for more stable alerts

### Branch 2: Fire monitoring

- `YOLOv11` localizes candidate fire regions
- `MobileNetV3-Small` verifies `fire` vs `non-fire`
- This two-stage design helps suppress false positives from red clothes, lights, and reflections

## Key results from the capstone report

- Overall test accuracy: `93.66%`
- Macro F1-score: `89.41%`
- Human branch best validation accuracy: `78.26%`
- Human branch best validation F1-score: `0.73`
- Fire detection branch mAP@50: `0.8071`
- Fire verification CNN validation accuracy: `99.93%`

These results support the main project goal: a practical abnormal-event detection pipeline that can run on a single `NVIDIA RTX 3060` workstation and still remain useful for real surveillance scenarios.

## Repository contents

This project package currently includes the report plus source and model artifacts, mostly as archives:

```text
.
|-- AI_Based_Abnormal_Behavior_Detection_from_Surveillance.pdf
|-- CodeApp.zip                  # Flask app and inference pipeline
|-- CodeTrain.zip                # Training notebooks, logs, and experiment outputs
|-- checkpointsmodel.zip         # Exported checkpoints
|-- LinkCode&Dataset.txt         # Shared project/dataset link
|-- DataTrainSlowFast/           # Dataset archive parts
|-- DataTrainYolo/               # Dataset archive parts
`-- DataFire (Restore)/          # Dataset archive parts
```

After extracting the main archives, the important folders are expected to look like this:

```text
CodeApp/app/
CodeTrain/TrainSlowFast/
CodeTrain/TrainYolo11PoseDetection/
CodeTrain/TrainYolo11FireDetection/
CodeTrain/TrainCNNVerification/
checkpointsmodel/
```

## Quick start

### 1. Extract the project archives

Extract at least these files before running anything:

- `CodeApp.zip`
- `CodeTrain.zip`
- `checkpointsmodel.zip`

If you only upload this project to GitHub, keeping the archive-based layout is still fine. If you want others to run it immediately, extract the folders first.

### 2. Set up the app

```bash
cd CodeApp/app
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Main dependencies:

- `Flask`
- `torch`
- `torchvision`
- `ultralytics`
- `opencv-python`
- `pytorchvideo`

### 3. Prepare checkpoints

The app expects these model files inside `CodeApp/app/checkpoints/`:

- `best_model_pose.pth`
- `customyolov11m.pt`
- `best_model_fire.pt`
- `fire_red_cnn.pth`

The package already includes these checkpoints in the app archive and in `checkpointsmodel.zip`.

### 4. Run the dashboard

```bash
python app.py
```

Then open `http://localhost:5000`.

## Training resources

The training side of the project is stored in `CodeTrain.zip` and includes:

- `TrainSlowFast/` for pose-guided action recognition
- `TrainYolo11PoseDetection/` for person/pose detection
- `TrainYolo11FireDetection/` for fire detection
- `TrainCNNVerification/` for fire/non-fire verification

Datasets are not fully unpacked in this repo. The shared link is listed in `LinkCode&Dataset.txt`, and the current root folder also contains split dataset archives for restoration.

## Limitations

- The system depends on the detector stage; missed person detection can prevent downstream action recognition
- Heavy occlusion, unusual viewpoints, and low light still affect reliability
- The paper discusses temporal aggregation in detail, but the current demo app mainly uses tracking, smoothing, and persistence logic for practical deployment

## Reference

- Project report: `AI_Based_Abnormal_Behavior_Detection_from_Surveillance.pdf`
- App entrypoint after extraction: `CodeApp/app/app.py`
- Main runtime pipeline after extraction: `CodeApp/app/detect_track_action.py`
