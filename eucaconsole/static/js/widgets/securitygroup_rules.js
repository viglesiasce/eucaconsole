/**
 * @fileOverview Security Group rules editor JS
 * @requires AngularJS
 *
 */

angular.module('SecurityGroupRules', [])
    .controller('SecurityGroupRulesCtrl', function ($scope) {
        $scope.rulesEditor = $('#rules-editor');
        $scope.rulesTextarea = $scope.rulesEditor.find('textarea#rules');
        $scope.rulesArray = [];
        $scope.selectedProtocol = '';
        $scope.resetValues = function () {
            $scope.trafficType = 'ip';
            $scope.fromPort = '';
            $scope.toPort = '';
            $scope.cidrIp = '';
            $scope.selectedProtocol = '';
            $scope.icmpRange = '-1';  // Default to 'All' if ICMP traffic type
            $scope.groupName = '';
            $scope.ipProtocol = 'tcp';
            $scope.hasDuplicatedRule = false;
            $('#ip-protocol-select').chosen({'width': '90%', search_contains: true});
            $('#ip-protocol-select').val('').trigger('chosen:updated');
        };
        $scope.syncRules = function () {
            $scope.rulesTextarea.val(JSON.stringify($scope.rulesArray));
            $scope.resetValues();
        };
        $scope.initRules = function (rulesArray) {
            // Get existing rules and shove into scope
            $scope.rulesArray = JSON.parse(rulesArray);
            $scope.syncRules();
            $scope.setWatchers();
        };
        // Watch for those two attributes update to trigger the duplicated rule check in real time
        $scope.setWatchers = function () {
            $scope.$watch('cidrIp', function(){ $scope.checkForDuplicatedRules();});
            $scope.$watch('groupName', function(){ $scope.checkForDuplicatedRules();});
            $scope.$watch('trafficType', function(){ $scope.checkForDuplicatedRules();});
        };
        // In case of the duplicated rule, add the class 'disabled' to the submit button
        $scope.getAddRuleButtonClass = function () {
            if( $scope.hasDuplicatedRule == true ){
                return 'disabled';
            }
        };
        // Run through the existing rules with the newly create rule to ensure that the new rule does not exist already
        $scope.checkForDuplicatedRules = function () {
            $scope.hasDuplicatedRule = false;
            // Create a new array block based on the current user input on the panel
            var thisRuleArrayBlock = $scope.createRuleArrayBlock();
            for( var i=0; i < $scope.rulesArray.length; i++){
                // Compare the new array block with the existing ones
                if( $scope.compareRules(thisRuleArrayBlock, $scope.rulesArray[i]) ){
                    // Detected that the new rule is a dup
                    // this value will disable the "Add Rule" button to prevent the user from submitting
                    $scope.hasDuplicatedRule = true;
                    return;
                }
            }
            return;
        };
        // Compare the rules to determine if they are the same rules
        // First, compare the three common attributes [from_port, to_port, ip_protocol]
        // Second, the rule can have a direct IP range value or have an access granted group name
        // Third, if the rule has the direct IP range value, compare that value and return true if they are same, else return false
        //        if the rule has the granted gropu, compare that value instead. 
        $scope.compareRules = function(block1, block2){
            // IF the ports and the protocol are the same,
            if( block1.from_port == block2.from_port
                && block1.to_port == block2.to_port
                && block1.ip_protocol == block2.ip_protocol){
                // IF cidr_ip is not null, then compare cidr_ip  
                if( $scope.trafficType == "ip" && block1.grants[0].cidr_ip != null ){
                    if( block1.grants[0].cidr_ip == block2.grants[0].cidr_ip ){
                        // The rules are the same 
                        return true;
                    }else{
                        // the rules have different IP ranges
                        return false;
                    }
                // ELSE IF compare the group name
                }else if( block1.grants[0].name != null ){
                    if( block1.grants[0].name == block2.grants[0].name ){
                        // the rules are the same
                        return true;
                    }else{
                        // the rules have different granted group names
                        return false;
                    }
                }
            }
            // the rules have different ports or ip_protocol, or incomplete.
            return false;
        };
        $scope.removeRule = function (index, $event) {
            $event.preventDefault();
            $scope.rulesArray.splice(index, 1);
            $scope.syncRules();
        };
        // Adjust the IP Protocol atrributes for specical cases
        $scope.adjustIpProtocol = function () {
            if ($scope.selectedProtocol === 'icmp') {
                $scope.fromPort = $scope.icmpRange;
                $scope.toPort = $scope.icmpRange;
                $scope.ipProtocol = 'icmp'
            } else if ($scope.selectedProtocol === 'udp') {
                $scope.ipProtocol = 'udp'
            }
        };
        // Create an array block that represents a new security group rule submiitted by user
        $scope.createRuleArrayBlock = function () {
            return {
                'from_port': $scope.fromPort,
                'to_port': $scope.toPort,
                // Warning: Ugly hack to properly set ip_protocol when 'udp' or 'icmp'
                'ip_protocol': $scope.ipProtocol,
                'grants': [{
                    'cidr_ip': $scope.cidrIp ? $scope.trafficType == 'ip' && $scope.cidrIp : null,
                    'group_id': null,
                    'name': $scope.groupName ? $scope.trafficType == 'securitygroup' && $scope.groupName : null
                }],
                'fresh': 'new'
            }; 
        };
        $scope.addRule = function ($event) {
            $event.preventDefault();
            if( $scope.hasDuplicatedRule == true ){
                return false;
            }
            // Trigger form validation to prevent borked rule entry
            var form = $($event.currentTarget).closest('form');
            form.trigger('validate');
            if (form.find('[data-invalid]').length) {
                return false;
            }

            $scope.adjustIpProtocol();
            // Add the rule
            $scope.rulesArray.push($scope.createRuleArrayBlock());
            $scope.syncRules();
        };
        $scope.cancelRule = function ($event) {
            $event.preventDefault();
            $scope.resetValues();
        };
        $scope.setPorts = function (port) {
            if (!isNaN(parseInt(port, 10))) {
                $scope.fromPort = port;
                $scope.toPort = port;
            } else {
                $scope.fromPort = $scope.toPort = '';
            }
            $('#groupname-select').chosen({'width': '50%', search_contains: true});
            $('#groupname-select').val('').trigger('chosen:updated');
        };
        $scope.useMyIP = function (myip) {
            $scope.cidrIp = myip + "/32";
            $('#input-cidr-ip').focus();
        };
    })
;
