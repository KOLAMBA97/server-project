export const serversModule = angular.module('servers',[])
.component('serversList', {
    templateUrl: '/partials/servers/list',
    controller:[
        'Server',
        'Task',
        'NotificationService',
        function(Server, Task, NotificationService){
            this.servers = Server.query();
            this.addTasks = function(){
                if(confirm('Вы хотите добавить задания?')){
                    Task.addRandom(function(){
                        NotificationService.showSuccess('Задания добавленны')
                    });
                }
            }
    }]
}).component('serversEdit', {
    templateUrl: '/partials/servers/edit',
    controller:[
        'Server',
        '$stateParams',
        '$state',
        'NotificationService',
        function(Server, $stateParams, $state, NotificationService){
            if($stateParams.id){
                this.server = Server.get({id:$stateParams.id});
            }else{
                this.server = new Server();
            }
            this.save = function(){
                this.server.$save(function(){
                    NotificationService.showSuccess('Сервер сохранен')
                    $state.go('servers',{},{reload: true});
                })
            }
            
    }]
}).component('serversView', {
    templateUrl: '/partials/servers/view',
    controller:[
        'Server',
        '$stateParams',
        'NotificationService',
        'Charts',
        function(Server, $stateParams, NotificationService, Charts){
            this.server = Server.get({id: $stateParams.id});
            this.charts = Charts.serverCharts({serverId: $stateParams.id});
            this.restart = function(){
              if(confirm('Вы хотите перезапустить сервер?')){
                  this.server.$restart(function(){
                      NotificationService.showSuccess('Сервер перезапущен')
                  })
              }
          }
            this.start = function(){
                if(confirm('Вы хотите запустить сервер?')){
                    this.server.$start(function(){
                        NotificationService.showSuccess('Сервер запущен')
                    })
                }
            }
            this.stop = function(){
                if(confirm('Вы хотите остановить сервер?')){
                    this.server.$stop(function(){
                        NotificationService.showSuccess('Сервер остановлен')
                    })
                }
            }
    }]
}).directive('serverUserActionTable', [
      '$compile', 'dataTableLanguage', function($compile, dataTableLanguage) {
        return {
          restrict: 'A',
          scope: {
            'onDraw': '&',
            'filter': '<',
            'serverId': '<',
          },
          link: function(scope, element) {
            const dt = element.DataTable({ // eslint-disable-line new-cap
              ordering: false,
              searching: true,
              processing: true,
              serverSide: true,
              language: dataTableLanguage,
              ajax: '/journals/user-actions/' + scope.serverId,
              columns: [
                {
                  data: 'date',
                },
                {
                  data: 'user',
                },
                {
                  data: 'action',
                },
              ],
              order: [[0, 'desc']],
              createdRow: function(row, data) {
                const localScope = scope.$new(true);
                localScope.data = data;
                $compile(angular.element(row).contents())(localScope);
              },
            });
            dt.columns().every(function() {
              const that = this;
              $('input', this.header()).on('change', function() {
                if (that.search() !== $(this).val()) {
                  that.search($(this).val(), false, false).draw();
                }
              });
              $('select', this.header()).on('change', function() {
                if (that.search() !== $(this).val()) {
                  that.search($(this).val()).draw();
                }
              });
            });
            dt.on('draw', function() {
              scope.onDraw({params: dt.ajax.params()});
            });
          },
        };
      }]).directive('serverTasksTable', [
      '$compile', 'dataTableLanguage', function($compile, dataTableLanguage) {
        return {
          restrict: 'A',
          scope: {
            'onDraw': '&',
            'filter': '<',
            'serverId': '<',
          },
          link: function(scope, element) {
            const dt = element.DataTable({ // eslint-disable-line new-cap
              ordering: false,
              searching: true,
              processing: true,
              serverSide: true,
              language: dataTableLanguage,
              ajax: '/tasks/list/' + scope.serverId,
              columns: [
                {
                  data: 'date',
                },
                {
                  data: 'name',
                },
                {
                  data: 'completeDuration',
                },
                {
                  data: 'isComplete',
                  render:function(row,data,full){
                    return full.isComplete? 'Да': 'Нет';
                  },
                },
              ],
              order: [[0, 'desc']],
              createdRow: function(row, data) {
                const localScope = scope.$new(true);
                localScope.data = data;
                $compile(angular.element(row).contents())(localScope);
              },
            });
            dt.columns().every(function() {
              const that = this;
              $('input', this.header()).on('change', function() {
                if (that.search() !== $(this).val()) {
                  that.search($(this).val(), false, false).draw();
                }
              });
              $('select', this.header()).on('change', function() {
                if (that.search() !== $(this).val()) {
                  that.search($(this).val()).draw();
                }
              });
            });
            dt.on('draw', function() {
              scope.onDraw({params: dt.ajax.params()});
            });
          },
        };
      }])
      .component('tasksChart', {
        templateUrl: '/partials/servers/default-chart',
        bindings: {
          report: '<',
        },
        controller: [
          function() {
            this.$onInit = function() {
              this.chartParams = {
                type: 'bar',
                data: {
                  datasets: [
                    {
                      label: 'Выполненные',
                      data: this.report.complete,
                      backgroundColor: this.report.complete.map(function() {
                        return '#0000ff';
                      }),
                    },
                    {
                      label: 'Невыполненные',
                      data: this.report.notComplete,
                      backgroundColor: this.report.notComplete.map(function() {
                        return '#ff0000';
                      }),
                    },
                  ],
  
                  labels: this.report.labels,
                },
                options: {
                  responsive: true,
                  legend: {
                    display: false,
                    position: 'left',
                  },
                  scales: {
                    x: {
                      stacked: false,
                      beginAtZero: true,
                    },
                    y: {
                      stacked: false,
                      min: 0,
                    },
                  },
                },
  
              };
            };
          }],
      });