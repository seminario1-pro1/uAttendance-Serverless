const AWS = require("aws-sdk");
const S3 = new AWS.S3({
  accessKeyId: "AKIA5M3XKPWM66MKUS4R",
  secretAccessKey: "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",
});
const RKG = new AWS.Rekognition({
  accessKeyId: "AKIA5M3XKPWM66MKUS4R",
  secretAccessKey: "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",
});

function getStudents() {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: "pro1-images-grupo16",
      Prefix: "estudiantes",
    };
    S3.listObjectsV2(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Contents);
      }
    });
  });
}

function getAssists() {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: "pro1-images-grupo16",
      Prefix: "fotos-grupales",
    };
    S3.listObjectsV2(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Contents);
      }
    });
  });
}

function checkAssists(studentPhoto, groupPhoto) {
  return new Promise((resolve, reject) => {
    const params = {
      SimilarityThreshold: 90,
      SourceImage: {
        S3Object: {
          Bucket: "pro1-images-grupo16",
          Name: studentPhoto,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: "pro1-images-grupo16",
          Name: groupPhoto,
        },
      },
    };
    RKG.compareFaces(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.FaceMatches.length);
      }
    });
  });
}

exports.handler = async () => {
  try {
    const assistsPhotos = await getAssists();
    const studentsPhotos = await getStudents();
    let results = [];
    for (
      let assistIndex = 0;
      assistIndex < assistsPhotos.length;
      assistIndex++
    ) {
      const assistPhoto = assistsPhotos[assistIndex];
      let assists = [];

      for (
        let studentIndex = 0;
        studentIndex < studentsPhotos.length;
        studentIndex++
      ) {
        const studentPhoto = studentsPhotos[studentIndex];
        const present = await checkAssists(studentPhoto.Key, assistPhoto.Key);
        assists.push({ student: studentPhoto.Key, present: present });
      }
      results.push({ assist: assistPhoto.Key, students: assists });
    }
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(results),
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
