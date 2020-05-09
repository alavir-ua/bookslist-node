[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

# A simple bookstore written in the express js framework.  

This is a simple implementation of a bookstore with a user account and administrative part.


## Getting Started
These instructions will provide you with a copy of the project that will be launched on your local computer for development and testing.

## Prerequisites
What things you need to install the software.

- Git.
- NPM.
- MongoDB account.
- Stripe Account.
- XAMPP (or another local server).
- IDE (or code editor)


## Install
Clone the git repository on your computer
```
$ git clone https://github.com/alavir-ua/bookslist-node.git
```
You can also download the entire repository as a zip file and unpack in on your computer if you do not have git

After cloning the application, you need to install it's dependencies.
```
$ npm install
```

## Set environment keys
When you finish the installation, rename the .env.example file in the root directory of your project to .env and fill it with the variables of your local development environment.

## MySQL database recovery 
Using the books-list.sql file in the root directory of your project, restore the local MySQL database. You can also add your users through the registration form, as well as the site administrator by setting the "role" field to "admin" for it. To get into the administrative part, just log in with administrator settings.

## Run the application
```
$ node server.js
```
After that, open the browser at http://localhost:3000/ to view the result.
## Links
[Live Demo](https://bookslist-node.herokuapp.com/)
