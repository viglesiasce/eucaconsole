/**
 * @fileOverview IAM Group Detaile Page JS
 * @requires AngularJS
 *
 */

angular.module('GroupPage', ['PolicyList'])
    .controller('GroupPageCtrl', function ($scope, $timeout) {
        $scope.groupUsers = [];
        $scope.allUsers = [];
        $scope.initController = function (group_users, all_users) {
            $scope.groupUsers = group_users;
            $scope.allUsers = all_users;
            $timeout(function(){ $scope.activateChosen(); }, 100);
        };
        $scope.activateChosen = function () {
            $("#users-select").chosen();
            $("#users_select_chosen .chosen-choices").bind("DOMSubtreeModified", function(e) {
                $timeout(function(){ $scope.adjustGroupUsers(); }, 100);
            });
        };
        $scope.adjustGroupUsers = function () {
            var newUsers = [];
            $("#users_select_chosen .chosen-choices .search-choice").each(function (index){
                var thisUser = $( this ).text();
                newUsers.push(thisUser);
            });
            var userAdded = false;
            if( $scope.groupUsers.length < newUsers.length ){
                userAdded = true;
            }
            $scope.groupUsers = newUsers;
            if( userAdded == true ){
                $scope.$apply();
            }
        };
        $scope.removeUser = function (user) {
            $("#users_select_chosen .chosen-choices .search-choice").each(function (index){
                var thisUser = $( this ).text();
                if( thisUser == user ){
                    $( this ).children('a').click();
                }
            });
        };
        $scope.isSelected = function (user) {
            for (i in $scope.groupUsers){
                if( user == $scope.groupUsers[i] ){
                   return true;
                }
            }
           return false;
        };
    })
;



