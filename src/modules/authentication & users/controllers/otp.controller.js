import sendMail from "../../../shared/utils/mail.service.js";
import Otp from "../models/otp.model.js";
import PersonalEmail from "../models/personalEmail.model.js";
import readTemplate from "../utils/readTemplate.utils.js";
class OtpControllers {
  createOptAndSendMail = async (req, res) => {
    const { email } = req.params;
    try {
      const isPersonalEmailRecordExist = await PersonalEmail.findOne({
        email: email,
      });

      console.log(isPersonalEmailRecordExist);

      if (isPersonalEmailRecordExist) {
        return res.send({
          success: false,
          message: `A personal email record is already exist with the same mail id: ${email}`,
          data: {
            isVerified: true,
          },
        });
      }
      const isOtpForThisMailExist = await Otp.findOne({ personalMail: email });
      if (isOtpForThisMailExist) {
        return res.send({
          success: false,
          message: `A OTP is already generated for this the same mail id: ${email}`,
        });
      }
      const OTP = await Otp.create({ personalMail: email });
      console.log(OTP);
      if (OTP) {
        const mailTemplate = await readTemplate("otp.html", OTP.otp);
        if (!mailTemplate) {
          return res.send({
            success: false,
            message: "can't read email template",
          });
        }
        const info = await sendMail({
          mailTemplate: mailTemplate,
          receiverEmail: email,
          subject: "Please verify your email",
        });
        console.group(info);
        if (info) {
          return res.send({
            success: true,
            message: `OTP has been send to the mail ${email}`,
          });
        }
        return res.send({
          success: false,
          message: "can't send the mail",
        });
      }
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
  verifyOtpAndCreatePersonalEmailRecord = async (req, res) => {
    const { email } = req.params;
    const { otp } = req.body;

    try {
      const isRecordExist = await Otp.findOne({
        otp: Number(otp),
        personalMail: email,
      });
      if (isRecordExist) {
        const personalEmailRecord = await PersonalEmail.create({
          email: email,
          isVerified: true,
        });
        if (personalEmailRecord) {
          await Otp.findOneAndUpdate(
            { otp: otp, personalMail: email },
            { isUsed: true },
          );
          return res.send({
            success: true,
            message: `otp is verified and a new record of personal mail id is registered with ${email}`,
          });
        }
      }
      return res.send({
        success: false,
        message: `otp record with this ${email} id is not found`,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        success: false,
        message: error.message,
      });
    }
  };
}

export default new OtpControllers();
