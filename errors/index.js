exports.routeNotFound = (req, res) => {
  res.status(404).send({ msg: 'Route Not Found' });
};

exports.methodNotAllowed = (req, res) => {
  res.status(405).send({ msg: 'Method Not Allowed' });
};

exports.handlePSQL = (err, req, res, next) => {
  if (err.code) {
    console.log(err);
    res.status(400).send({ msg: `Invalid Request. Database Error ${err.code}` });
  } else {
    next(err);
  }
};

exports.handle400 = (err, req, res, next) => {
  if (err.status >= 400 && err.status < 500) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500 = (err, req, res, next) => {
  res.status(500).send({ msg: 'Internal Server Error' });
};
