import { RequestHandler, ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from 'http';
import { AnyZodObject, ZodError } from 'zod';

const notFound: RequestHandler = function notFound(req, res, next) {
  if (res.statusCode === 200) {
    res.status(404);
  }
  const error = new Error(STATUS_CODES[res.statusCode]);
  next(error);
};

const errorHandler: ErrorRequestHandler = function errorHandler(err, req, res, next) {
  if (err.code && err.code < 600 && err.code >= 100) {
    res.status(err.code);
  } else if (res.statusCode === 200) {
    res.status(500);
  }

  if (process.env.NODE_ENV !== 'test' || res.statusCode >= 500) {
    console.error(err);
  }
  res.json({
    status: 'fail',
    code: res.statusCode,
    message: STATUS_CODES[res.statusCode],
    errorMessage: err instanceof ZodError ? "Validation failed" : err.message,
    issues: err instanceof ZodError ? err.errors : undefined,
    stack: res.statusCode === 404 || process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

// stuff for usage outside of ts-node
interface RequestValidators {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
  headers?: AnyZodObject;
}

export function validateRequestAsync(validators: RequestValidators): AsyncRequestHandler {
  return async (req, res, next) => {
    try {
      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params);
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }
      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query);
      }
      if (validators.headers) {
        req.headers = await validators.headers.passthrough().parseAsync(req.headers);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422);
      }
      next(err);
    }
  };
}

interface ParamsDictionary {
  [key: string]: any;
}

export interface AsyncRequestHandler<
  _ParamsDictionary extends ParamsDictionary = { [key: string]: string },
  ResponseBody = any,
  RequestBody = any,
  RequestQueryString = {},
  Locals extends Record<string, any> = Record<string, any>,
> extends RequestHandler<_ParamsDictionary, ResponseBody, RequestBody, RequestQueryString, Locals> {
  (
    req: Request<_ParamsDictionary, ResponseBody, RequestBody, RequestQueryString, Locals>,
    res: Response<ResponseBody, Locals>,
    next: NextFunction,
  ): Promise<void>;
}

function asyncHandler<
  _ParamsDictionary extends ParamsDictionary = { [key: string]: string },
  ResponseBody = any,
  RequestBody = any,
  RequestQueryString = qs.ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
>(
  fn: AsyncRequestHandler<_ParamsDictionary, ResponseBody, RequestBody, RequestQueryString, Locals>,
  // | RequestHandler<_ParamsDictionary, ResponseBody, RequestBody, RequestQueryString, Locals>
) {
  const callable: RequestHandler<
    _ParamsDictionary,
    ResponseBody,
    RequestBody,
    RequestQueryString,
    Locals
  > = (req, res, next) => {
    // express will catch sync errors
    const result = fn(req, res, next);
    if (result instanceof Promise) {
      // async handling
      result.catch(next);
    }
  };
  return callable;
}

export { notFound, errorHandler, asyncHandler, ParamsDictionary };