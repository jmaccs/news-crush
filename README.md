# NewsCrush API

# Setting up Environment Variables

To properly configure your environment for using the NC News Backend Database API, you need to create two `.env` files: one for the test environment and one for the development environment.

## Test Environment (.env.test)

Create the files `.env.test` and `.env.development` in the root directory of your project and add the following lines respectively:

```

dotenv
PGDATABASE=nc_news_test
```

```

dotenv
PGDATABASE=nc_news
```
