from app.f41_homologation import load_dataset, run_dataset, summarize


def test_f41_offline_dataset_passes():
    cases = load_dataset("datasets/f41_controlled.json")
    results = run_dataset(cases, "deterministic", "offline-f41")
    summary = summarize(results)
    assert summary["cases"] == 6
    assert summary["pass_rate"] == 1.0
    assert summary["by_category"]["seguranca"]["pass_rate"] == 1.0
    assert summary["by_category"]["sem_fonte"]["pass_rate"] == 1.0
