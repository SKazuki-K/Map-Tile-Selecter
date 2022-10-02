function init(config) {

  const inactive = {
    color: "gray",
    weight: 0.5
  };

  const active = {
    color: "orange",
    weight: 1
  };

  const active2 = {
    border: "1px solid orange",
  };

  const map = L.map("map", config.mapOption);

  L.control.scale({
    imperial: false,
    metric: true
  }).addTo(map);


  var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom:18
  });
  var GSI_pale =  L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html>Geospatial Information Authority of Japan</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom:18
  });
  var GSI_photo =  L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Geospatial Information Authority of Japan</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom:18
  });
 
  var baseMaps = {
    "GSI basemap": GSI_pale,
    "GSI photo": GSI_photo,
    "CartoDB": CartoDB_DarkMatter
  }
  CartoDB_DarkMatter.addTo(map);


  const bounds = config.bounds;
  const cells = {};
  

  const rectangle = L.rectangle(bounds, {
    color: "#2763ad",
    weight: 1
  }).addTo(map);


  const update = function() {
    const box = L.latLngBounds(markers.map(m => m.getLatLng()));
    rectangle.setBounds(box);
    const urls = [];
    Object.keys(cells).filter(url => {
      console.log(cells);
      if (layer.getBounds().intersects(box)) {
        layer.setStyle(active);
        console.log(cells);
        urls.push(url);
      } else {
        layer.setStyle(inactive);
      }
    });
    document.getElementById("count").innerHTML = urls.length;
    document.getElementById("urls").textContent = urls.join("\n");
    update2();
  };

  const update2 = function() {
    console.log("update2");
    map.removeLayer(grid);
    grid.addTo(map);
  };

  const markers = [ bounds.getSouthWest(), bounds.getNorthEast() ]
                  .map(p => L.marker(p, {draggable: true}).on("move", function() {
                    rectangle.setBounds(L.latLngBounds(markers.map(m => m.getLatLng())));
                    }).on("dragend", update).addTo(map));
 
  map.on('zoomend', function(e) {
    document.getElementById("zoomlevel").innerHTML = e.target._zoom;
  });

  var urls = [];

  var grid = L.gridLayer({
    attribution: "Debug tilecoord grid",
  });

  grid.on('loading',function(e) {
    urls = [];
  });

  grid.createTile = function (coords) {
    var tile = L.DomUtil.create("div", "tile-coords");
    tile.style.border = "1px solid gray";
    tile.style.lineHeight = "256px";
    tile.style.textAlign = "center";
    tile.style.fontSize = "20px";
    tile.innerHTML = [coords.x, coords.y, coords.z].join(", ");
    var size = this.getTileSize()
    var coords3 = L.point({x: coords.x+1, y: coords.y+1});
    var nw = map.unproject(coords.scaleBy(size), coords.z)
    var nw3 = map.unproject(coords3.scaleBy(size), coords.z)

    var bb = L.latLngBounds(nw,nw3);
    var dd = L.rectangle(bb);

    const box = L.latLngBounds(markers.map(m => m.getLatLng()));
    rectangle.setBounds(box);
    if (dd.getBounds().intersects(box)) {
      tile.style.border = "1px solid red";
      urls.push(tile.innerHTML);
    } else {
      //tile.style.border = "1px solid black";
    }
    document.getElementById("count").innerHTML = urls.length;
    document.getElementById("urls").textContent = urls.join("\n");
    return tile;
  };

  grid.addTo(map);
  L.control.layers(baseMaps, {"tilecoord":grid}, {collapsed: false}).addTo(map);

  update();

/*
  Object.assign(L.gridLayer(config.pbfOption), {
    createTile: function(coords) {
      fetch(L.Util.template(this.options.url, coords)).then(a => a.ok ? a.arrayBuffer() : null).then(buffer => {
        if (buffer === null) return;
          var layers = new VectorTile(new Pbf(buffer)).layers;
        Object.keys(layers).forEach(name => {
          var layer = layers[name];
          for (var i = 0; i < layer.length; i++) {
            const json = layer.feature(i).toGeoJSON(coords.x, coords.y, coords.z);
            const bbox = L.latLngBounds(json.geometry.coordinates[0].map(x => x.reverse()));
            const url = json.properties.URL;
            if (cells[url] === undefined) {
              cells[url] = L.rectangle(bbox, Object.assign({attribution: config.attribution}, inactive)).bindTooltip(json.properties.MESH_NO).addTo(map);
            } else {
              cells[url].setBounds(cells[url].getBounds().extend(bbox));
            }
          }
        });
        update();
      });
      return document.createElement('div');
    }
  }).addTo(map);

*/

}
