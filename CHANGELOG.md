# Master (Unreleased)

# 2.1.0 - 28 November, 2021

### New features:

- Implement support for graceful shutdown #583
- Emit a success event after a successful job invocation. #643

# 2.0.0 - 01 February, 2021

### Breaking changes:

- Drop support for Node < 6
- Remove support for job objects. See `UPGRADING.md` for more details. #557

### New features:

- Introduce compatibility with browsers and Electron #553

### Bug fixes:

- Avoid leaking memory on one-off jobs #581
- Address anonymous job id collision problem to ensure that node-schedule could run with the unlimited uptime #582

### Internal changes:

- Bump cron-parser from 2.18.0 to 3.1.0 #562
- Bump sinon from 1.17.7 to 9.2.4 #566  
- Switch to nyc from istanbul #574
- Convert tests from nodeunit to Tape #575
- Replace var with let/const #577
- Execute airtap tests on a headless Chromium #578
- Make structure more modular #579
