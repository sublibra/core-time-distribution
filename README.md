# core-time-distribution

Core time distribution is a dashboard powered by [Qlik Core](https://core.qlik.com) showing time distribution between
different development tasks (feature, enhancement, maintenance, admin). 

## Usage

Note that before you deploy, you must accept the [Qlik Core EULA](https://core.qlik.com/eula/) by setting the
ACCEPT_EULA environment variable.

```bash
ACCEPT_EULA=yes docker-compose up -d
```

When the docker container is up and running you need to build the application using
[corectl](https://github.com/qlik-oss/corectl).

```bash
corectl build
```

When finished, you are ready to run the react.js application:

```bash
npm install
npm start
```

## Repo architecture

```txt
Content:
/artifacts  - contains Qlik Associative Engine artifacts such as objects, measures etc
/data       - source data (the team's estimations)
/src        - react-js UI showing the dashboard
corectl.yml - corectl configuration file
```

