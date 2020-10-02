const {appendFileSync} = require('fs')
const footer = '\n\n---\n\n<a href="https://www.freepik.com/vectors/party">Party vector created by gstudioimagen - www.freepik.com</a>'

appendFileSync('./README.md', footer)