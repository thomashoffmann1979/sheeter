Description
===========

Sheeter is a spreadsheet structure. It aims to be the backend for
client and server side javascript spreadsheet programs.

Installation
============

Note: This is a really early state of code, so you can have a look inside. But please
don't use it in any program, at this time!
    
    [sudo] npm install sheeter -g

or

    [sudo] npm install git+https://github.com/thomashoffmann1979/sheeter.git -g

ToDo
====

* adding support for open document spreadsheet (*.ods)


Usage
=====

Displaying the content or list the sheets inside (if more than one sheet is inside).
    
    sheeter <myfile>
    
Displaying the content of <mysheet>.

    sheeter <myfile> <mysheet>

Showing all arguments.

    sheeter -h

Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.0 or newer
