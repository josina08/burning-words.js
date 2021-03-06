/**
 * Burning Words
 * Effect of burning text with an ability to customize colors,
 * fonts, burning speed and other parameters.
 *
 * Version: 1.2
 * Author: Michael Ryvkin, http://www.gyrocode.com
 * License: GNU Lesser General Public License, http://www.gnu.org/licenses/lgpl.html
 * Created: 2010-04-17
 * Last updated: 2014-05-12
 * Link: https://github.com/gyrocode/burning-words.js
 */
function BurningWords(text, args){
   function BurningWords_Start(){
      var dc = self.canvas.getContext('2d');

      var width_rgba = (self.canvas.width * 4);

      var image_data_len = width_rgba * self.canvas.height;
      for(var pos = 0; pos < image_data_len; pos += 4){
         if(self.image_src.data[pos] == 255){
            self.image_flame.data[pos] = Math.floor(Math.random() * 256);
         }
      }

      for(pos = 0; pos < (image_data_len - width_rgba); pos+=4){
         var x = pos % width_rgba;

         var l = self.image_flame.data[ ((x === 0) ? pos + width_rgba : pos) - 4 ];
         var r = self.image_flame.data[ ((x == width_rgba - 4) ? pos - width_rgba : pos) + 4 ];
         var b = self.image_flame.data[ pos + width_rgba ];
         var avg = Math.floor((l + r + b + b) / 4 - self.fire_decay);

         if (avg < 0){ avg = 0; }

         self.image_flame.data[pos] = avg;
      }

      for(pos = 0; pos < image_data_len; pos+=4){
         if(self.image_flame.data[pos] > self.smoke_threshold){
            var c = self.image_flame.data[pos];
            var pal = self.palette;
            var a = 1 - pal[c][3]/255;
            if(a < 0){ a = 0; }
            if(a > self.bg_color_a){ a = self.bg_color_a; }

            self.image.data[pos]     = Math.min(255, pal[c][0] + Math.floor(self.bg_color_r * a));
            self.image.data[pos + 1] = Math.min(255, pal[c][1] + Math.floor(self.bg_color_g * a));
            self.image.data[pos + 2] = Math.min(255, pal[c][2] + Math.floor(self.bg_color_b * a));
            self.image.data[pos + 3] = Math.max(self.bg_color_a, pal[c][3]);

         } else {
            self.image.data[pos]     = self.bg_color_r;
            self.image.data[pos + 1] = self.bg_color_g;
            self.image.data[pos + 2] = self.bg_color_b;
            self.image.data[pos + 3] = self.bg_color_a;
         }
      }

      dc.putImageData(self.image, 0, 0);

      dc.fillStyle    = self.text_color_string;
      dc.font         = self.font_string;
      dc.textAlign    = 'center';
      dc.textBaseline = 'bottom';
      dc.fillText(self.text, self.canvas.width/2, self.canvas.height);
   }

   var self = {};
   self.interval_id = null;
   self.canvas      = null;

   if(typeof args !== 'object'){ args = {}; }
   self.args = args || {};
   self.args.text_color = args.text_color || 'FFFFCC';
   self.args.font = args.font || 'Times New Roman';
   self.args.font_size = args.font_size || 30;
   self.args.bg_color = args.bg_color || 'FFFFFF';
   self.args.bg_alpha = args.bg_alpha || 0;
   self.args.speed = args.speed || 'normal';
   self.args.id = args.id || '';

   // Define a palette
   self.smoke_threshold = 50;
   self.palette = [];
   for(var i = 0; i < 256; i++){
      if(i > 128){
         self.palette[i] = [255, 255, 255, 255];
      } else if(i > 110){
         self.palette[i] = [233, 242, 63, 255];
      } else if(i > 92){
         self.palette[i] = [214, 102, 28, 255];
      } else if(i > 77){
         self.palette[i] = [90, 0, 0, 2 * i];
      } else {
         self.palette[i] = [0, 0, 0, 3 * ((i < self.smoke_threshold) ? 0 : (i - self.smoke_threshold))];
      }
   }


   self.font_string = self.args.font_size + 'px ' + self.args.font;

   self.text = text || 'burning-words.js';
   self.text_color_string = 'rgb('
      + parseInt(self.args.text_color.substring(0, 2), 16) + ','
      + parseInt(self.args.text_color.substring(2, 4), 16) + ','
      + parseInt(self.args.text_color.substring(4, 6), 16) + ')';

   self.bg_color_r = parseInt(self.args.bg_color.substring(0, 2), 16);
   self.bg_color_g = parseInt(self.args.bg_color.substring(2, 4), 16);
   self.bg_color_b = parseInt(self.args.bg_color.substring(4, 6), 16);
   self.bg_color_a = Math.floor(255 * self.args.bg_alpha / 100);
   self.bg_color_a_pct = self.args.bg_alpha / 100;

   self.bg_color_string = 'rgba(' + self.bg_color_r + ',' + self.bg_color_g + ',' + self.bg_color_b + ',' + self.bg_alpha + ')';

   // If animation speed is given in milliseconds
   var speed_msec;
   if(self.args.speed && !isNaN(Number(self.args.speed)) && self.args.speed.toString().match(/^\s+$/) === null){
      speed_msec = self.args.speed;

   // Otherwise, if animation speed is given as a keyword
   } else {
      switch(self.args.speed){
      case 'x-fast':
         speed_msec =  10; break;
      case 'fast':
         speed_msec =  25; break;
      case 'slow':
         speed_msec = 100; break;
      case 'x-slow':
         speed_msec = 150; break;
      case 'normal':
         speed_msec =  50; break;
      default:
         speed_msec =  50; break;
      }
   }

   if(!self.args.id || !document.getElementById(self.args.id)){
      var counter = 1;
      while(document.getElementById('text-burning-' + counter)){ counter++; }
      self.args.id = 'text-burning-' + counter;
   }

   var canvas_id;
   var el = document.getElementById(self.args.id);
   if(!el){
      document.write('<canvas id="' + self.args.id + '" style="font-family:' + self.args.font + '; font-size:' + self.args.font_size + 'px"></canvas>');
      canvas_id = self.args.id;

   } else {
      el.innerHTML = '<canvas id="' + self.args.id + '-canvas" style="font-family:' + self.args.font + '; font-size:' + self.args.font_size + 'px"></canvas>';
      canvas_id = self.args.id + '-canvas';
   }


   self.canvas = document.getElementById(canvas_id);

   if(self.canvas.getContext){
      var dc = self.canvas.getContext('2d');
      dc.font = self.font_string;
      self.text_size = dc.measureText(self.text);

      self.canvas.width  = 1.05 * self.text_size.width;
      self.canvas.height = Math.floor(self.args.font_size * 1.4);

      self.fire_decay = 30 * 3 / self.args.font_size;

      dc.fillStyle = 'rgb(0,0,0)';
      dc.fillRect(0, 0, self.canvas.width, self.canvas.height);
      self.image = dc.getImageData(0, 0, self.canvas.width, self.canvas.height);

      dc.fillStyle = 'rgb(0,0,0)';
      dc.fillRect(0, 0, self.canvas.width, self.canvas.height);
      self.image_flame = dc.getImageData(0, 0, self.canvas.width, self.canvas.height);

      dc.fillStyle = 'rgb(0,0,0)';
      dc.fillRect(0, 0, self.canvas.width, self.canvas.height);

      dc.fillStyle    = 'rgb(255,255,255)';
      dc.font         = self.font_string;
      dc.textAlign    = 'center';
      dc.textBaseline = 'bottom';
      dc.fillText(text, self.canvas.width/2, self.canvas.height);
      self.image_src = dc.getImageData(0, 0, self.canvas.width, self.canvas.height);

      dc.putImageData(self.image, 0, 0);

      self.interval_id = setInterval(function(){ BurningWords_Start(); } , speed_msec);

   } else {
      el.innerHTML = 'Canvas element is not supported';
   }
}
