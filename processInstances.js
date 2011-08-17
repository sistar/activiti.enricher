var sys = require('sys'),
    rest = require('restler'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    async = require('async'),
    events = require('events');
// create a service constructor for very easy API wrappers a la HTTParty...
Activiti = rest.service(function(u, p) {
    this.defaults.username = u;
    this.defaults.password = p;
}, {
    baseURL: 'http://localhost:8080/activiti-rest/service/'
}, {
    list: function() {
        return this.get('process-instances?size=1000', {  });


    }
});

exports['dueDates'] = function(daysAllowed,processInstanceIds, clientResponseData, modifiedDataHandler) {

    var client = new Activiti('cor', 'cor');
    var self = this;
    self.modifiedDataHandler = modifiedDataHandler;
    self.modifiedData= clientResponseData;
    self.targetArray = self.modifiedData.data;

    client.list().on('complete',
        function(response) {
            console.log('assigning due dates');
            var calculatedDueDates = {};
            for (pi in response.data) {
                var startTimeString = response.data[pi].startTime;
                var startTime = new Date(startTimeString);
                startTime.setHours(startTime.getHours() + daysAllowed * 24);
                calculatedDueDates[response.data[pi].id] = startTime;
            }
            ;
            for (bIdx in self.targetArray) {
                var curProcessInstanceId = self.targetArray[bIdx].processInstanceId;
                self.targetArray[bIdx]['due-date'] = calculatedDueDates[curProcessInstanceId].toLocaleDateString(calculatedDueDates[curProcessInstanceId]);
            }

            self.modifiedDataHandler(self.modifiedData);
        }).on('error', function(err) {
            console.log(err);
            self.modifiedDataHandler(self.modifiedData);
        });


}
