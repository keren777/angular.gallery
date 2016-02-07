var http = require('http');
var express = require('express');
var connect = require('connect');

var app = connect().use(express.static(__dirname +  '/public'));
http.createServer(app).listen(8080);