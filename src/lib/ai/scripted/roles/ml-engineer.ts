import type { RoleTemplate } from "../role-template";

export const mlEngineer: RoleTemplate = {
  id: "ml-engineer",
  title: "ML engineer",
  keywords: [
    "ml engineer", "machine learning", "ml", "computer vision", "deep learning", "pytorch",
    "tensorflow", "model training", "koneoppiminen", "koneoppimisinsinööri", "konenäkö",
  ],
  skills: ["ml-evaluation", "data-quality", "code-review", "ai-assisted-work", "testing"],
  why: {
    "ml-evaluation": "A grasp model that looks accurate on paper still drops parcels if it was tested the wrong way.",
    "data-quality": "Camera frames repeat, drift and mislabel. The model learns whatever the data says.",
  },
  lookFor: {
    "ml-evaluation": "Notices whether the split, the threshold choice and the metric match how the robot is used.",
    "code-review": "Points to the exact lines that cause the problem and proposes a concrete change.",
  },
  constraints: [
    "you could label only 200 more frames this week",
    "the model has to run on the robot's own processor",
    "the warehouse adds a new type of parcel next month",
    "the release date cannot move",
  ],
  challenge: {
    title: "Review an AI-written model evaluation",
    format: "review",
    brief:
      "Our pick robots use a vision model to predict whether a grasp will hold. A teammate asked an AI assistant to write the evaluation for the new model. The report says 97% accuracy and the team wants to ship it on Monday. About 4% of real grasps fail. Before it ships, we would like a second pair of eyes on how it was tested.",
    material: {
      kind: "code",
      title: "evaluate_grasp_model.py",
      body: [
        "import numpy as np",
        "from sklearn.model_selection import train_test_split",
        "from sklearn.metrics import accuracy_score",
        "",
        "# frames: one row per camera frame, ~30 frames per grasp attempt",
        "frames = load_frames(\"warehouse_logs/2026-10/\")",
        "X, y = frames.features, frames.grasp_held  # 1 = held, 0 = dropped",
        "",
        "X_train, X_test, y_train, y_test = train_test_split(",
        "    X, y, test_size=0.2, random_state=7, shuffle=True",
        ")",
        "",
        "model = GraspNet().fit(X_train, y_train)",
        "probs = model.predict_proba(X_test)[:, 1]",
        "",
        "# pick the threshold that gives the highest accuracy",
        "thresholds = np.linspace(0.05, 0.95, 19)",
        "accs = [accuracy_score(y_test, probs > t) for t in thresholds]",
        "best_t = thresholds[int(np.argmax(accs))]",
        "",
        "print(f\"accuracy: {max(accs):.3f} at threshold {best_t:.2f}\")",
        "save_release(model, threshold=best_t)",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the frame-level random split that leaks frames of the same grasp into both sets",
        cues: ["leak", "same grasp", "group", "per grasp", "by grasp", "by attempt", "split by", "shuffle", "frames from the same", "correlated", "groupkfold", "session"],
      },
      {
        label: "the threshold tuned on the test set",
        cues: ["tuned on the test", "on the test set", "on the test data", "validation", "holdout", "test set to pick", "overfit"],
      },
      {
        label: "accuracy hiding the rare dropped grasps",
        cues: ["accuracy", "imbalance", "imbalanced", "4%", "recall", "precision", "false positive", "dropped grasps", "confusion matrix", "rare"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a training script",
    format: "review",
    brief: "An AI assistant wrote this to prepare data for a defect detector. It runs without errors.",
    material: {
      kind: "code",
      title: "prepare.py",
      body: [
        "images = load_images(\"line_3/\")",
        "mean, std = images.mean(), images.std()",
        "images = (images - mean) / std",
        "train, test = split(images, test_size=0.2)",
        "model.fit(train)",
        "print(model.score(test))",
      ].join("\n"),
    },
    deliverable: "What is the one thing you would change first, and why?",
    flaws: [
      {
        label: "normalisation statistics computed before the split",
        cues: ["mean", "std", "normali", "before the split", "before splitting", "leak", "whole dataset", "all images"],
      },
    ],
  },
};
