
export function qsParser() {
  return (req, res, next) => {
    if (req._qs) {
      next();
    }

    // query string params already parsed
    req._qs = true;

    const { query } = req;
    req.qs = Object.keys(query).reduce((cur, key) => {
      let val = query[key];
      if (typeof val === 'string') {
        const isJson = val.startsWith('{') || val.startsWith('[');
        if (isJson) {
          try {
            val = JSON.parse(val);
          } catch (e) {
            return cur;
          }
        }
      }
      cur[key] = val;
      return cur;
    }, {});

    next();
  };
}

export function respondOk(ok) {
  const resp = {
    success: true,
    message: 'OK',
    code: 200,
    ...ok,
  };
  this.status(resp.code).json(resp);
}

export function respondError(error) {
  if (error instanceof Error) {
    error = { message: error.message };
  }

  const resp = {
    success: false,
    message: 'Error',
    code: 500,
    ...error,
  };
  this.status(resp.code).json(resp);
}

export function respondUnauthorized(message) {
  const code = 401;
  this.status(code).json({
    code,
    success: false,
    message,
  });
}

export function respondForbidden(message) {
  const code = 403;
  this.status(code).json({
    code,
    success: false,
    message,
  });
}
