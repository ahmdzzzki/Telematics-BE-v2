module.exports = {
  success: (res, data) => {
    return res.status(200).json({
      status: "success",
      data: data,
    });
  },
  error: (res, error) => {
    return res.status(500).json({
      status: "error",
      message: error,
    });
  },
  unauthorized: (res, error) => {
    return res.status(401).json({
      status: "Your username / password wrong",
      message: error,
    });
  },
};
