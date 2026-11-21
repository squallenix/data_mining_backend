import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let miningState = {
  status: "idle",
  progress: 0,
  stage: "Ready to mine",
  targetUrl: null,
  logs: [],
  error: null,
  lastRunAt: null,
};

export const startMiningJob = (targetUrl, maxProducts = 30, features = null) => {
  if (miningState.status === "processing") {
    return {
      started: false,
      message: "A mining job is already in progress",
      state: miningState,
    };
  }

  miningState = {
    status: "processing",
    progress: 5,
    stage: "Starting Python Universal Mining Engine...",
    targetUrl,
    logs: [`[${new Date().toLocaleTimeString()}] Mining job queued for: ${targetUrl}${features ? ` (Features: ${features})` : ""}`],
    error: null,
    lastRunAt: new Date().toISOString(),
  };

  // 1. Resolve Python binary: support both "python" and "python3" automatically
  let pythonBin = process.env.PYTHON_BIN;
  if (!pythonBin) {
    pythonBin = process.platform === "win32" ? "python" : "python3";
  }
  // On Linux/Docker, if "python" doesn't exist but "python3" does, automatically fallback to python3
  if (process.platform !== "win32" && pythonBin === "python") {
    if (!fs.existsSync("/usr/bin/python") && fs.existsSync("/usr/bin/python3")) {
      pythonBin = "/usr/bin/python3";
    }
  }

  // 2. Candidate locations for run_mining.py
  const scriptCandidates = [
    process.env.PYTHON_SCRIPT_PATH,
    path.resolve(process.cwd(), "python/app/run_mining.py"),
    path.resolve(process.cwd(), "app/run_mining.py"),
    path.resolve(process.cwd(), "../data_mining_python/app/run_mining.py"),
    "e:\\Code\\data_mining_python\\app\\run_mining.py",
  ].filter(Boolean);

  let pythonScript = null;
  for (const candidate of scriptCandidates) {
    const absPath = path.isAbsolute(candidate) ? candidate : path.resolve(process.cwd(), candidate);
    if (fs.existsSync(absPath)) {
      pythonScript = absPath;
      break;
    }
  }

  if (!pythonScript) {
    const msg = `Could not locate run_mining.py. Checked: ${scriptCandidates.join(", ")}`;
    console.error(`[Mining Error] ${msg}`);
    miningState.status = "failed";
    miningState.error = msg;
    miningState.stage = "Python script missing";
    return { started: false, message: msg, state: miningState };
  }

  const port = process.env.PORT || 8001;
  const backendUrl = process.env.INTERNAL_BACKEND_URL || `http://127.0.0.1:${port}`;

  const spawnArgs = [
    "-u",
    pythonScript,
    "--url",
    targetUrl,
    "--backend",
    backendUrl,
    "--max-products",
    String(maxProducts),
  ];
  if (features) {
    spawnArgs.push("--features", String(features));
  }

  console.log(`[Mining Spawn] Spawning ${pythonBin} ${spawnArgs.join(" ")} in cwd: ${path.dirname(pythonScript)}`);

  const child = spawn(pythonBin, spawnArgs, {
    cwd: path.dirname(pythonScript),
    env: {
      ...process.env,
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: path.dirname(pythonScript),
    },
  });

  child.on("error", (err) => {
    console.error(`[Python Spawn Error]:`, err);
    miningState.status = "failed";
    miningState.error = `Spawn error: ${err.message} (Binary: ${pythonBin}, Script: ${pythonScript})`;
    miningState.stage = "Failed to launch Python engine";
  });

  child.stdout.on("data", (data) => {
    const text = data.toString();
    const lines = text.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      console.log(`[Python Mine]: ${line}`);
      miningState.logs.push(line);
      if (miningState.logs.length > 100) miningState.logs.shift();

      if (line.includes("[Stage 1/5]")) {
        miningState.progress = 20;
        miningState.stage = "Scraping target website (Universal + Detail)...";
      } else if (line.includes("[Stage 2/5]")) {
        miningState.progress = 45;
        miningState.stage = "Cleaning data & deriving universal features...";
      } else if (line.includes("[Stage 3/5]")) {
        miningState.progress = 65;
        miningState.stage = "Training ML models (Regression, Classification, Clustering)...";
      } else if (line.includes("[Stage 4/5]")) {
        miningState.progress = 80;
        miningState.stage = "Exporting timestamped CSV dataset...";
      } else if (line.includes("[Stage 5/5]")) {
        miningState.progress = 90;
        miningState.stage = "Synchronizing products with database...";
      }
    }
  });

  child.stderr.on("data", (data) => {
    const errText = data.toString();
    console.error(`[Python Err]: ${errText}`);
    miningState.logs.push(`[WARN] ${errText}`);
  });

  child.on("close", (code) => {
    if (code === 0) {
      miningState.status = "completed";
      miningState.progress = 100;
      miningState.stage = "Mining completed successfully!";
      miningState.logs.push("[COMPLETE] Mining job finished with exit code 0.");
    } else {
      miningState.status = "failed";
      if (!miningState.error) {
        miningState.error = `Process exited with error code ${code}`;
      }
      miningState.stage = "Mining job failed";
    }
  });

  return {
    started: true,
    message: "Mining job initiated",
    state: miningState,
  };
};

export const getMiningStatus = () => {
  return miningState;
};

export const getLatestAnalytics = () => {
  const backendAnalyticsPath =
    process.env.ANALYTICS_PATH || path.resolve(process.cwd(), "latest_analytics.json");
  const pythonAnalyticsPath =
    process.env.PYTHON_ANALYTICS_PATH ||
    (fs.existsSync(path.resolve(process.cwd(), "../data_mining_python/app/data/latest_analytics.json"))
      ? path.resolve(process.cwd(), "../data_mining_python/app/data/latest_analytics.json")
      : fs.existsSync(path.resolve(process.cwd(), "python/app/data/latest_analytics.json"))
      ? path.resolve(process.cwd(), "python/app/data/latest_analytics.json")
      : "e:\\Code\\data_mining_python\\app\\data\\latest_analytics.json");

  const targetPath = fs.existsSync(backendAnalyticsPath)
    ? backendAnalyticsPath
    : fs.existsSync(pythonAnalyticsPath)
    ? pythonAnalyticsPath
    : null;

  if (targetPath) {
    try {
      const rawData = fs.readFileSync(targetPath, "utf-8");
      // Sanitize bare NaNs to null for strict JSON compliance
      const sanitized = rawData.replace(/:\s*NaN\b/g, ": null");
      return JSON.parse(sanitized);
    } catch (e) {
      console.error("Failed to read analytics file:", e);
    }
  }

  // Empty state analytics structure when no active dataset exists
  return {
    sourceDomain: null,
    targetUrl: "",
    cleaning: {
      summary: {
        totalRecords: 0,
        totalColumns: 0,
        missingValues: 0,
        duplicateRecords: 0,
        completeness: 0,
        outliersCapped: 0,
      },
      missingData: [],
      columns: [],
      preview: [],
    },
    prediction: {
      modelComparison: [],
      classificationComparison: [],
      priceDistribution: [],
      confusionMatrix: [],
      elbowCurve: [],
      clusters: [],
      availableTargets: {
        regression: [],
        classification: [],
      },
    },
  };
};
