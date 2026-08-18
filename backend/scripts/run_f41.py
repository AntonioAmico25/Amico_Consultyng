import argparse
import json
from app.f41_homologation import load_dataset, run_dataset, save_report

p = argparse.ArgumentParser()
p.add_argument("--dataset", default="datasets/f41_controlled.json")
p.add_argument("--provider", default="deterministic")
p.add_argument("--model", default="offline-f41")
p.add_argument("--out", default="f41_report.json")
a = p.parse_args()
results = run_dataset(load_dataset(a.dataset), a.provider, a.model)
payload = save_report(results, a.out)
print(json.dumps(payload["summary"], ensure_ascii=False, indent=2))
raise SystemExit(0 if payload["summary"]["pass_rate"] == 1.0 else 2)
