import type { RoleTemplate } from "../role-template";

export const mobileEngineer: RoleTemplate = {
  id: "mobile",
  title: "Mobile engineer",
  keywords: [
    "mobile", "ios", "android", "swift", "kotlin", "react native", "flutter", "app developer",
    "mobiilikehittäjä", "mobiilisovellus",
  ],
  skills: ["mobile-constraints", "ui-state", "error-handling", "code-review"],
  why: {
    "mobile-constraints": "Field technicians use the app in basements and lifts, where the network drops often.",
    "error-handling": "A lost report means a technician drives back to the site.",
  },
  lookFor: {
    "mobile-constraints": "Considers lost network, the app being closed mid-upload and battery use.",
    "ui-state": "Checks what the technician sees while saving, after a failure and after reopening the app.",
  },
  constraints: [
    "technicians were offline for a whole shift",
    "the photos were 12 MB each",
    "the app had to support phones from 2019",
    "the backend could not change this quarter",
  ],
  challenge: {
    title: "Review an AI-written upload screen",
    format: "review",
    proofKind: "code",
    brief:
      "Our technicians send a service report with photos after each job. A teammate wrote the new submit logic with an AI assistant. It works on office wifi. In the field, the network drops and people lock the phone right after tapping send. Please review it before release.",
    material: {
      kind: "code",
      title: "ReportScreen.kt",
      body: [
        "fun onSendClicked(report: Report) {",
        "    viewModelScope.launch {",
        "        showMessage(\"Report sent\")",
        "        navigateBack()",
        "",
        "        val photoUrls = report.photos.map { photo ->",
        "            api.uploadPhoto(photo.readBytes())",
        "        }",
        "        api.submitReport(report.copy(photoUrls = photoUrls))",
        "        localDb.deleteDraft(report.id)",
        "    }",
        "}",
        "",
        "// api uses the default OkHttp client",
        "suspend fun uploadPhoto(bytes: ByteArray): String =",
        "    client.post(\"/photos\", bytes).body.url",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the success message shown before the upload finishes",
        cues: ["before", "report sent", "success message", "misleading", "shown first", "optimistic", "navigateback"],
      },
      {
        label: "the upload tied to the screen instead of a background job that survives the app closing",
        cues: ["viewmodelscope", "background", "workmanager", "killed", "closed", "lock", "lifecycle", "cancelled", "queue"],
      },
      {
        label: "the missing retry and offline handling that loses the report",
        cues: ["offline", "retry", "network", "failure", "catch", "draft", "lost", "connectivity"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a location request",
    format: "review",
    proofKind: "code",
    brief: "An AI assistant wrote this to show nearby service points.",
    material: {
      kind: "code",
      title: "NearbyScreen.swift",
      body: [
        "override func viewDidLoad() {",
        "  super.viewDidLoad()",
        "  locationManager.desiredAccuracy = kCLLocationAccuracyBest",
        "  locationManager.startUpdatingLocation()",
        "}",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "the continuous high-accuracy location that drains the battery",
        cues: ["battery", "stop", "stopupdatinglocation", "continuous", "accuracy", "requestlocation", "permission", "once"],
      },
    ],
  },
};
