const AWS = require("aws-sdk");
const S3 = new AWS.S3({
  accessKeyId: "AKIA5M3XKPWM66MKUS4R",
  secretAccessKey: "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",
});
const DDB = new AWS.DynamoDB({
  accessKeyId: "AKIAZGKNALCRW6HLSNAS",
  secretAccessKey: "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",
});

function uploadImageS3(encodedImage) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.from(encodedImage, "base64");
    let imagePath = "fotos-grupales/" + Date.now().toString() + ".jpg";
    let params = {
      Bucket: "uattendance-photos",
      Key: imagePath,
      Body: buffer,
      ACL: "public-read",
    };
    S3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
}

function insertIntoDDB(name, photo) {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: "tabla-fotoGrupal-semi1-pro1",
      Item: {
        nombre: { S: name },
        foto: { S: photo },
      },
    };
    DDB.putItem(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

exports.handler = async (event) => {
  try {
    const image = await uploadImageS3(event.photo);
    const insert = await insertIntoDDB(event.name, image);
    const response = {
      statusCode: 200,
      body: insert,
    };
    return response;
  } catch (error) {
    const response = {
      statusCode: 400,
      body: error,
    };
    return response;
  }
};
