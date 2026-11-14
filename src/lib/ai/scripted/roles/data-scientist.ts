import type { RoleTemplate } from "../role-template";

export const dataScientist: RoleTemplate = {
  id: "data-scientist",
  title: "Data scientist",
  keywords: [
    "data scientist", "data science", "forecasting", "forecast", "time series", "predictive model",
    "datatieteilijä", "datatiede", "ennustemalli", "ennustaminen",
  ],
  skills: ["ml-evaluation", "data-quality", "experiment-design", "stakeholder-communication", "ai-assisted-work"],
  why: {
    "ml-evaluation": "Grid operators buy reserve power based on the forecast. A forecast tested the wrong way costs real money.",
    "data-quality": "Meter data arrives late, repeats and has gaps. The forecast learns all of it.",
  },
  lookFor: {
    "ml-evaluation": "Checks whether the test period comes after the training period and whether the error measure works when load is near zero.",
    "data-quality": "Notices inputs that would not exist at forecast time and says how to check for them.",
  },
  constraints: [
    "the forecast had to be ready 36 hours ahead instead of one hour",
    "you only had six months of history",
    "the operator needed a range instead of a single number",
    "a new district with rooftop solar joined the grid next month",
  ],
  challenge: {
    title: "Review an AI-written load forecast evaluation",
    format: "review",
    brief:
      "We forecast hourly electricity load for a district grid, one hour ahead. A teammate used an AI assistant to write the evaluation for a new model. It reports a mean error of 1.8% and the operations team wants to switch on Monday. Before we do, we want someone to check how it was tested.",
    material: {
      kind: "code",
      title: "evaluate_load_forecast.py",
      body: [
        "import pandas as pd",
        "from sklearn.model_selection import train_test_split",
        "from sklearn.ensemble import GradientBoostingRegressor",
        "",
        "df = pd.read_parquet(\"grid/district_load_2024_2026.parquet\")",
        "# hourly rows: timestamp, load_mw, temp_c, hour, weekday",
        "df[\"temp_next_hour\"] = df[\"temp_c\"].shift(-1)  # measured temperature",
        "df = df.dropna()",
        "",
        "features = [\"hour\", \"weekday\", \"temp_c\", \"temp_next_hour\"]",
        "X_train, X_test, y_train, y_test = train_test_split(",
        "    df[features], df[\"load_mw\"], test_size=0.2, shuffle=True",
        ")",
        "",
        "model = GradientBoostingRegressor().fit(X_train, y_train)",
        "pred = model.predict(X_test)",
        "",
        "mape = (abs(pred - y_test) / y_test).mean() * 100",
        "print(f\"MAPE: {mape:.1f}%\")",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the random split that mixes future hours into training",
        topic: "the data split",
        cues: ["shuffle", "random split", "time series", "time-based", "chronological", "future", "split by time", "timeseriessplit", "walk-forward", "backtest"],
      },
      {
        label: "the measured next-hour temperature that would not exist at forecast time",
        topic: "the temperature input",
        cues: ["temp_next_hour", "next hour", "next-hour", "shift(-1)", "measured temperature", "actual temperature", "weather forecast", "not available", "leak"],
      },
      {
        label: "the percentage error that breaks when load is near zero",
        topic: "the error measure",
        cues: ["mape", "near zero", "divide by", "division", "zero load", "mae", "rmse", "percentage error", "small values"],
      },
    ],
  },
  taster: {
    title: "Check a forecast chart claim",
    format: "review",
    brief: "An AI assistant summarised a new demand forecast for a planning meeting.",
    material: {
      kind: "text",
      title: "Forecast note",
      body: [
        "Model: daily heat demand, trained on 2025.",
        "Tested on: January to March 2025.",
        "Mean error: 2.1%.",
        "Conclusion: ready to plan the 2026 winter.",
      ].join("\n"),
    },
    deliverable: "What is the one thing you would question first, and why?",
    flaws: [
      {
        label: "the test period that overlaps the training year",
        topic: "the test period",
        cues: ["2025", "same year", "overlap", "trained on", "test period", "unseen", "out of sample", "held out"],
      },
    ],
  },
};
