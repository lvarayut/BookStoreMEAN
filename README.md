#<span><img src="http://images.moneysavingexpert.com/images/OrangeLogo.jpg" alt="Orange" width="130" height="130" align="left" hspace="10"/> BookStore - MEAN (MongoDB, Express.js, Angular.js, Node.js)

[![Node.js](http://img.shields.io/badge/node-v0.10.29-brightgreen.svg)](http://nodejs.org/)
[![Express.js](http://img.shields.io/badge/express-v4.4.5-brightgreen.svg)](http://expressjs.com/) 
[![Angular.js](http://img.shields.io/badge/angular-v1.3.0-brightgreen.svg)](https://angularjs.org/) 
[![MongoDB](http://img.shields.io/badge/mongodb-v2.4.9-brightgreen.svg)](http://www.mongodb.org/)
[![Bootstrap](http://img.shields.io/badge/bootstrap-v3.2.0-brightgreen.svg)](http://getbootstrap.com/)

## Introduction
BookStoreMEAN is short for the BookStore application developed by using [MongoDB](http://www.mongodb.org/), [Express.js](http://expressjs.com/), [Angular.js](https://angularjs.org/), and [Node.js](http://nodejs.org/). Moreover, MySQL is also used in some parts of the application. For more details about the application, please take a look at the [original version](https://github.com/lvarayut/Bookstore).

## Requirements
As described in the [Introduction](#Introduction), these technologies should be installed in advance before installing the application. However, some of them are already included with this project. Thus, you must install just the following technologies, please follow instructions written in their official website:

1. [MongoDB Installation](http://docs.mongodb.org/manual/installation/).
2. [Node.js Installation](http://nodejs.org/download/).
3. [MySQL Installation](http://dev.mysql.com/downloads/installer/). 

**NOTE**: You have to manually create a database called `bsmean` in the MySQL.

## Installation
BookStoreMEAN is a modular application that composes of many external modules. In this section, the installation of both **Global modules** and **Dependencies** are clearly explained.

### Global modules
Firstly, you need to install **Nodemon** and **Mongoose-Fixture** globally, this will install them into your bin path and let you access them via CLI.

- [Nodemon](https://github.com/remy/nodemon) - `sudo npm install -g nodemon`


- [Mongoose-Fixture](https://github.com/mgan59/mongoose-fixture) - `sudo npm install -g mongoose-fixture`

### Dependencies
The dependencies are incredibly easy to be installed. Basically, Node.js has [Node Packaged Modules (NPM)](https://www.npmjs.org/) that hosts all modules for Node.js. Thus, in this project, there is a file called `package.json` used to indicate required dependencies that the application is depending on. Let's start installing them:

1. Open the terminal and go the your project directory.
2. Execute `sudo npm install`

## Getting Started
1. Run MongoDB and MySQL server
2. Open the terminal and go the your project directory.
3. Add data fixtures - `mongoose-fixture --fixture='all' --add`
4. Run application - `nodemon app.js`

That's it. Now, let's open your favorite browser and access `localhost:3000` to see my beautiful website!
