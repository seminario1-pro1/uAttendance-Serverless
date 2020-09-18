const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB({
  accessKeyId: "AKIAZGKNALCRW6HLSNAS",
  secretAccessKey: "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",
});

function getAllPhotos() {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: "tabla-fotoGrupal-semi1-pro1",
    };
    DDB.scan(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

exports.handler = async () => {
  try {
    const photos = await getAllPhotos();
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(photos),
    };
    return response;
  } catch (error) {
    const response = {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(error),
    };
    return response;
  }
};
