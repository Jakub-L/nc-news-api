# NC News API

Backend API for a news site supporting users, articles and comments.

# Table of Contents

- [Getting Started](#getting-started)
- [— Prerequisites](#prerequisites)
- [— Installation](#installation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Built With](#built-with)
- [Authors](#authors)
- [Acknowledgements](#acknowledgements)

# Getting Started

These instructions will get you a copy of the project running on your local machine with a set of development and testing data. This is for testing and development only; for production see [deployment](#deploymen)

## Prerequisites

The project requires you to have [PostgreSQL](https://www.postgresql.org/) installed. It also assumes that `npm` is available.

## Installation

Clone this repository:

```
git clone https://github.com/Jakub-L/nc-news-api.git
```

Install the package dependencies:

```
npm install
```

Generate a `knexfile.js` with database configuration (this may require adding your postgres credentials):

```
knex init -x nc-news-api
```

Initialise the databases:

```
npm run setup-dbs
```

Seed the database with development data:

```
npm run seed
```

Start the development server:

```
npm run dev
```

The API can now be reached at localhost on port 9090 (this can be changed in `listen.js`):

```js
// GET localhost:9090/api/articles/1
{
  "article": {
    "author": "jessjelly",
    "title": "Running a Node App",
    "article_id": 1,
    "body": "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
    "topic": "coding",
    "created_at": "2016-08-18T12:07:52.389Z",
    "votes": 0,
    "comment_count": "8"
  }
}
```

# Testing

In order to run the automated tests, first ensure the databases have been initialised (migrations and seeding are done automatically before each test):

```
npm run setup-dbs
```

Afterwards, the tests can be run for the entire package:

```
npm test
```

Or alternatively, only the utility functions can be tested by running:

```
npm run test-utils
```

# Deployment

The API is [hosted on Heroku](https://nc-news-jakub.herokuapp.com/).

# Available Scripts

- **`npm run setup-dbs`** - create test and development databases locally,
- **`npm run migrate-make`** - create a new migration file for Knex.js,
- **`npm run migrate-latest`** - run all migrations,
- **`npm run migrate-latest:prod`** - run all migrations (using [Heroku](https://www.heroku.com/) configuration),
- **`npm run migrate-rollback`** - rollback all migrations,
- **`npm run migrate-rollback:prod`** - rollback all migrations (using [Heroku](https://www.heroku.com/) configuration),
- **`npm test`** - run full testing suite,
- **`npm run test-utils`** - run testing suite for utility functions,
- **`npm run seed`** - rollback, migrate latest, then seed tables with development data,
- **`npm run seed:prod`** - rollback, migrate latest, then seed production tables (using [Heroku](https://www.heroku.com/) configuration)
- **`npm run dev`** - run server with `nodemon` for hot reload,
- **`npm start`** - run server with `node`

# API Reference

#### [GET] /api

Returns JSON object with all available endpoints.

---

#### [GET] /api/topics

Returns array with all article topic objects.

---

#### [GET] /api/articles?{author}&{topic}&{sort_by}&{order}&{p}&{limit}

Returns array with all article objects.

**Queries:**

- **`author`** (type: `string`): username of author
- **`topic`** (type: `string`): topic of article
- **`sort_by`** (type: `string`): name of column by which to sort returned data. Default: `created_at`
- **`order`** (type: `string`): order of sorting, can be `asc` for ascending or `desc` for descending. Default: `desc`
- **`p`** (type: `int`): page of results to return. Default: `1`
- **`limit`** (type: `int`): number of entries per page. Default `10`

---

#### [GET] /api/articles/{article_id}

Returns article object matching article ID.

**Path Params:**

- **`article_id`** (type: `int`): ID of article to return

---

#### [PATCH] /api/articles/{article_id}

Changes the number of votes for an article with matching article ID.

**Path Params:**

- **`article_id`** (type: `int`): ID of article to return

**Body Params:**

- **`inc_votes`** (type: `int`): number of votes to be added to article. Can be negative, for decrementing votes.

---

#### [DELETE] /api/articles/{article_id}

Removes an article with matching article ID.

---

#### [GET] /api/articles/{article_id}/comments?{sort_by}&{order}&{p}&{limit}

Retrieves all comments for an article with matching article ID.

**Path Params:**

- **`article_id`** (type: `int`): ID of article to return

**Queries:**

- **`sort_by`** (type: `string`): name of column by which to sort returned data. Default: `created_at`
- **`order`** (type: `string`): order of sorting, can be `asc` for ascending or `desc` for descending. Default: `desc`
- **`p`** (type: `int`): page of results to return. Default: `1`
- **`limit`** (type: `int`): number of entries per page. Default `10`

---

#### [POST] /api/articles/{article_id}/comments

Adds a comment for an article with matching article ID.

**Path Params:**

- **`article_id`** (type: `int`): ID of article to return

**Body Params:**

- **`username`** (type: `string`): username of author. Must exists in the `users` table.
- **`body`** (type: `string`): body of the comment to be added

---

#### [PATCH] /api/comments/{comment_id}

Changes the number of votes for a comment with matching comment ID.

**Path Params:**

- **`comment_id`** (type: `int`): ID of comment to return

**Body Params:**

- **`inc_votes`** (type: `int`): number of votes to be added to comment. Can be negative, for decrementing votes.

---

#### [DELETE] /api/comments/{comment_id}

Removes a comment with matching comment ID.

---

#### [GET] /api/users/{username}

Retrieves user object with matching username.

**Path Params:**

- **`username`** (type: `string`): username of user to return

# Built With

- **[PostgreSQL](https://www.postgresql.org/)**: Relational database used
- **[node-postgres](https://node-postgres.com/)**: Interfacing with PostgreSQL
- **[Express](https://expressjs.com/)**: Web framework used
- **[Knex.js](https://knexjs.org/)**: SQL query builder

# Authors

- **[Jakub-L](https://github.com/Jakub-L)**: Initial work

# Acknowledgements

- **[Northcoders](https://github.com/northcoders)**: For providing test and development data
