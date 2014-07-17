angular.module('l42y.amap.partition', []).factory('AmapPartition', function (
  $q,
  $window
) {
  function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function isNotEmptyList (data) {
    return data.list && data.list.length;
  }

  function isCityExist (data) {
    return data.city.name.length && (data.city.x && data.city.y);
  }

  return function amapPartition (type, city, district) {
    var method = 'by' + capitalise(type);
    var deferred = $q.defer();
    var partition = new $window.AMap.Partition();

    switch (type) {
    case 'city':
      partition[method](city, function (data) {
        if (isCityExist(data)) {
          deferred.resolve(data);
        } else {
          partition.byDistrict(city, city, function (data) {
            if (isNotEmptyList(data)) {
              partition[method](data.list[0].citycode, function (data) {
                if (isCityExist(data)) {
                  deferred.resolve(data);
                } else {
                  deferred.reject(data);
                }
              });
            } else {
              deferred.reject(data);
            }
          });
        }
      });
      break;

    case 'province':
      partition[method](function (data) {
        deferred.resolve(data);
      });
      break;

    case 'district':
      partition[method](district, city, function (data) {
        if (isNotEmptyList(data)) {
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      });
      break;

    default:
      deferred.reject('Incorrect type of district');
      break;
    }

    return deferred.promise;
  };
});
