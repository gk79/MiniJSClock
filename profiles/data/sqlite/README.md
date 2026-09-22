# Data profile: SQLite

Choose SQLite when the deployment/concurrency/availability requirements genuinely fit a single-file embedded relational database.

Good fit examples:

- single-host/local tools
- low operational complexity is important
- modest write concurrency
- no requirement for independent managed database scaling/high availability

Required project decisions:

- file location and permissions
- migration strategy
- backup/restore procedure
- locking/concurrency expectations
- how tests create isolated databases

Do not treat SQLite as "temporary" if production will depend on it: test the exact SQLite behavior and document backup/restore from the start.
