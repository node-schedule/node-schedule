---
'node-schedule': patch
---

Cancel the polling interval in `gracefulShutdown()` once all running jobs have finished, so the process can exit (#752)
