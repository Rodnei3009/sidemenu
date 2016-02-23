angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('DailyDash', function($scope, $interval, dateFilter) {
    
    var valueToPush = new Array();
    
    var registro = function(sistema, volume) {
        this.sistema = sistema;
        this.volume = volume
    };
    
    var dados = [];
    
    
    $scope.dataSourceOri = [];
    $scope.dataSourceTOP5 = [];
    $scope.dataSourceCateg = [];

    $scope.xenonPalette = ['#68b828','#7c38bc','#0e62c7','#fcd036','#4fcdfc','#00b19d','#ff6264','#f7aa47'];
        
    $scope.ano_mes_dia = dateFilter(new Date(), 'yyyyMMdd');
    $scope.data_exibir = moment($scope.ano_mes_dia, "YYYYMMDD").format('DD MMMM YYYY');
    
    var hoje = "";
    var qtd_dias = 0;
    
    data = new Date();
    hoje = dateFilter(new Date(), 'yyyyMMdd');
        
    $scope.currentTime = dateFilter(new Date(), 'hh:mm:ss');
    var updateTime = $interval(function() {
        $scope.currentTime = dateFilter(new Date(), 'hh:mm:ss');
    }, 1000);
    
    $scope.carregar = function (dat_carregar) {
        
        //alert('aqui');
        
        $scope.sla=0;
        $scope.vol_acum=0;
        $scope.reabertos=0;
        $scope.vcto_no_dia=0;
        
        var no_prazo = 0;
        var reabertos = 0;
        var vcto_no_dia = 0;
        var sla = 0;

        $scope.carregou = true;
        
        myData = new Firebase("https://itdashboard.firebaseio.com/ambev/volpi/" + dat_carregar.substring(0,6) + "/d" + $scope.ano_mes_dia);
        //myData = new Firebase("https://itdashboard.firebaseio.com/ambev/volpi/201512" + "/d20151201");
        myData.on('value', function(snapshot){
            
            myDataChamados = new Firebase("https://itdashboard.firebaseio.com/ambev/volpi/" + dat_carregar.substring(0,6) + "/d" + $scope.ano_mes_dia + "/chamados");
            //myDataChamados = new Firebase("https://itdashboard.firebaseio.com/ambev/volpi/201512" + "/d20151201" + "/chamados");
            myDataChamados.on('value', function(snapshotChamados){    
                    
                $scope.dataSourceOri = [];
                $scope.dataSourceTOP5 = [];
                $scope.dataSourceCateg = [];
                
                //$scope.sla          = snapshot.child('sla').val().toFixed(1);
                $scope.abertos      = snapshot.child('abertos').val();
                $scope.encerrados   = snapshot.child('encerrados').val();
                $scope.previstos    = snapshot.child('previstos').val();
                $scope.no_prazo     = snapshot.child('no_prazo').val();
                $scope.reabertos    = snapshot.child('reabertos').val();
                
                snapshotChamados.forEach(function(childSnapshotChamados) { //para cada chamado
    
                        if (childSnapshotChamados.child('abertura').val().toString().substring(0,8) === $scope.ano_mes_dia) {                    
                                                    
                            $scope.dataSourceOri.push({sistema: childSnapshotChamados.child('sistema').val().toString().substring(0,8), vol: 1});    
                            $scope.dataSourceCateg.push({categoria: childSnapshotChamados.child('categoria').val(), val: 1});
    
                        }
    
                });            
                
                $scope.dataSourceOri = groupBySistema($scope.dataSourceOri);            
                var dChart = $("#bar-5").dxChart("instance");
                dChart.option({ dataSource: $scope.dataSourceOri });
                dChart._render();
                
                $scope.dataSourceCateg = groupByCateg($scope.dataSourceCateg);
                var dChartCateg = $("#bar-10").dxPieChart("instance");
                dChartCateg.option({ dataSource: $scope.dataSourceCateg });
                dChartCateg._render();
    
                $scope.$apply();
                
                
            });
            $scope.carregou = false;
            $scope.data_exibir = moment($scope.ano_mes_dia, "YYYYMMDD").format('DD MMMM YYYY');
        });
        
    };
    
    $scope.before = function() {
        $scope.ano_mes_dia = moment($scope.ano_mes_dia, "YYYYMMDD").subtract(1, 'day').format('YYYYMMDD');
        $scope.carregar($scope.ano_mes_dia);
    };
    
    $scope.after = function() {
        $scope.ano_mes_dia = moment($scope.ano_mes_dia, "YYYYMMDD").add(1, 'day').format('YYYYMMDD');
        $scope.carregar($scope.ano_mes_dia);
    };

    function groupBySistema(data) {
        
        var result = [];
        var cont = 0;
        var encontrou = 0;
        
        for	(i = 0; i < data.length; i++) {
            if(cont === 0){
                result.push({sistema: data[i].sistema, vol: data[i].vol});
                cont = 1;
            } else {
                //$scope.currentTime = data[i].sistema;
                encontrou = 0;
                for	(j = 0; j < result.length; j++) {
                    if(data[i].sistema === result[j].sistema) {
                        result[j].vol = result[j].vol + data[i].vol;
                        //$scope.currentTime = data[i].sistema + ' - ' + result[j].sistema;
                        //return result;
                        encontrou = 1;
                    }
                }
                if(encontrou === 0){
                    result.push({sistema: data[i].sistema, vol: data[i].vol});
                }
            }            
        }     
        result.sort(sortArray);
        return result;
    };
    
    function sortArray(a, b) {
        if(a.length === 0){
            return 0;
        }
        
        if (a.vol === b.vol) {
            return 0;
        }
        else {
            return (a.vol < b.vol) ? -1 : 1;
        }
    };
    
    
    function groupByCateg(data) {
        
        var result = [];
        var cont = 0;
        var encontrou = 0;
        
        for	(i = 0; i < data.length; i++) {
            if(cont === 0){
                result.push({categoria: data[i].categoria, val: data[i].val});
                cont = 1;
            } else {
                //$scope.currentTime = data[i].sistema;
                encontrou = 0;
                for	(j = 0; j < result.length; j++) {
                    if(data[i].categoria === result[j].categoria) {
                        result[j].val = result[j].val + data[i].val;
                        //$scope.currentTime = data[i].sistema + ' - ' + result[j].sistema;
                        //return result;
                        encontrou = 1;
                    }
                }
                if(encontrou === 0){
                    result.push({categoria: data[i].categoria, val: data[i].val});
                }
            }            
        }     
        //result.sort(sortArray);
        return result;
    };
    
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
