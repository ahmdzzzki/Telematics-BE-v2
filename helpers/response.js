module.exports = {
  success: (res, data) => {
    return res.status(200).json({
      status: "success",
      stat_code : 200,
      data: data,
    });
  },
  error: (res, error) => {
    return res.status(500).json({
      status: "internal server error",
      stat_code : 500,
      message: error,
    });
  },
  requestError: (res, error) => {
    return res.status(400).json({
      status: "error",
      stat_code : 400,
      message: error,
    });
  },
  notFound: (res, error) => {
    return res.status(404).json({
      status: "error",
      stat_code : 404,
      message: error,
    });
  },
  unauthorized: (res, error) => {
    return res.status(401).json({
      stat_code : 401,
      status: "Your username / password wrong",
      message: error,
    });
  },
};
