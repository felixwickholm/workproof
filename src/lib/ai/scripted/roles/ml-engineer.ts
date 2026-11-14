import type { RoleTemplate } from "../role-template";

export const mlEngineer: RoleTemplate = {
  id: "ml-engineer",
  title: "Software engineer (machine learning)",
  level: "degree",
  keywords: [
    "ml engineer", "machine learning", "ml", "computer vision", "deep learning", "pytorch",
    "tensorflow", "model training", "koneoppiminen", "koneoppimisinsinööri", "konenäkö",
  ],
  skills: ["ml-evaluation", "data-quality", "code-review", "ai-assisted-work", "testing"],
  cues: {
    "ml-evaluation": ["look better than real life", "how a model is tested"],
  },
  why: {
    "ml-evaluation": "A grasp model that looks accurate on paper still drops parcels if it was tested the wrong way.",
    "data-quality": "Camera frames repeat, drift and mislabel. The model learns whatever the data says.",
  },
  lookFor: {
    "ml-evaluation": "Notices whether the split and the metric match how the robot is used.",
    "code-review": "Points to the exact lines that cause the problem and proposes a concrete change.",
  },
  constraints: [
    "you could label only 200 more frames this week",
    "the model has to run on the robot's own processor",
    "the warehouse adds a new type of parcel next month",
    "the release date cannot move",
  ],
  challenge: {
    minutes: 10,
    title: "Find the mistake in a robot's AI test",
    format: "fix",
    proofKind: "code",
    brief:
      "We build pick robots for cold-storage warehouses. A model guesses if a grasp will hold, and the test below says 97% accuracy. About 4% of real grasps fail, and one line hides a real bug. Which line is it, and what does it do to the 97%? This is a synthetic example.",
    material: {
      kind: "code",
      title: "evaluate_grasp_model.py",
      body: [
        "from sklearn.model_selection import train_test_split",
        "from sklearn.metrics import accuracy_score",
        "",
        "# one row per camera frame, about 30 frames per grasp attempt",
        "frames = load_frames(\"warehouse_logs/2026-10/\")",
        "X, y = frames.features, frames.grasp_held  # 1 = held, 0 = dropped",
        "",
        "X_train, X_test, y_train, y_test = train_test_split(",
        "    X, y, test_size=0.2, random_state=7, shuffle=True",
        ")",
        "",
        "model = GraspNet().fit(X_train, y_train)",
        "print(\"accuracy:\", accuracy_score(y_test, model.predict(X_test)))",
      ].join("\n"),
    },
    deliverable: "Name the line with the bug, say what it does to the result, and show the fix.",
    flaws: [
      {
        label: "the frame-level random split that puts frames of one grasp in both sets",
        cues: ["leak", "same grasp", "group", "per grasp", "by grasp", "by attempt", "split by", "shuffle", "frames from the same", "correlated", "groupkfold", "session"],
      },
      {
        label: "accuracy that hides the rare dropped grasps",
        cues: ["accuracy", "imbalance", "imbalanced", "4%", "recall", "precision", "dropped grasps", "confusion matrix", "rare"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a training script",
    format: "fix",
    proofKind: "code",
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
