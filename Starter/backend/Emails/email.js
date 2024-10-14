const { MailtrapClient } = require("mailtrap");

const TOKEN = "3d09157799472f4a47d28dc1145d1451";

exports.MailTrapClient = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.com",
  name: "Mailtrap Test",
};

const recipients = [
  {
    email: "victorajayidamilare@gmail.com",
  }
];

exports.verifyMail = async (client, username, verificationCode) => {

    try {
        await client.send({
                            from: sender,
                            to: recipients,
                            template_uuid: "fa1fa6ce-2ecb-4ebf-88cc-b50ed3e69165",
                            template_variables: {
                                "user_name": username,
                                "code": verificationCode,
                                "sender__name": "maria curie",
                            }
                        })
                       

        console.log('email sent')

    } catch(error) {
        console.log('cant send mail')
    }
}

exports.welcomeMail = async (client, username, sendername) => {


    try {

        await client.send({
                        from: sender,
                        to: recipients,
                        template_uuid: "a0f05386-86f2-43eb-923c-300b389cc545",
                        template_variables: {
                            "user_name": username,
                            "sender__name": sendername
                        }
                })

       console.log('welcome email sent')
    } catch(err) {
        console.log(err)
        console.log('welcome email not sent')
    }
}

exports.forgotPassword = async (client, companyname, username, resetlink) => {

    try {

      client
        .send({
          from: sender,
          to: recipients,
          template_uuid: "84b11913-bb3d-4b1a-b315-a2a1c2259bb4",
          template_variables: {
            "company_name": companyname,
            "user_name": username,
            "reset_link": resetlink,
          }
        })

    } catch(error) {
      console.log('forgot password email not sent')
    }

}


exports.resetSuccessful = async (client, companyname, username) => {
  try {

    client
      .send({
        from: sender,
        to: recipients,
        template_uuid: "ef4a2132-3dfd-4e36-86e4-cc94d0eafc6f",
        template_variables: {
          "company_name": "Test_Company_name",
          "user_name": "Test_User_name",
         
        }
      })
 
  } catch(error) {
    console.log('reset succesful email not sent')
  }
}