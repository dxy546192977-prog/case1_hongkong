## [ERR-20260509-001] shell_python_missing

**Logged**: 2026-05-09T10:46:00+08:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
The local shell does not provide a `python` command; use `python3` for quick validation scripts.

### Error
```
(eval):1: command not found: python
```

### Context
- Command attempted: a short `python` script to fetch and inspect `http://127.0.0.1:3000/flipbook.html`.
- Environment: macOS shell in this project workspace.

### Suggested Fix
Use `python3` for local one-off scripts in this workspace.

### Metadata
- Reproducible: yes
- Related Files: public/flipbook.html

---
