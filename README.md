# Library Card Registration Form For Folio
A web service for self registration of users in [Folio](folio.org). One path for public users and one path for SAML authenticated users which are authorized against a user directory to lookup which sort of account should get created.
- Users need an email address and a swedish personnummer (social security number) to create an account
- Public users get blocked for check out so that they identify them selves at the library first.  
- Authenticated users are not blocked.

Users have the ability to reset their password via email.

For testing purposes you can configure your setup to point to the different test servers available from the Folio project found in the [Folio wiki](https://wiki.folio.org).

SAML authentication testing can be done against [https://samltest.id](https://samltest.id). Regarding authorization you need to write your own implementation for your directory.

## Getting started
Before getting started, make sure you have installed [Node.js](https://nodejs.org/en/) (preferably the LTS version) and [Visual Studio Code](https://code.visualstudio.com/).

1. Clone this repository.
2. Run *npm install* from inside the directory.
3. Make a copy of *.env_example*.
4. Change the name of the copied file to *.env*
5. Add configurations to the *.env* file (you can try the project without adding anything).
6. Open the folder in *Visual Studio Code*.
7. Open *app.js* and click *f5* to run the project.
8. Visit localhost:8080 in your browser.
