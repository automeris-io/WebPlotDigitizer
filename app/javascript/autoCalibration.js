/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer
    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>
    This file is part of WebPlotDigitizer.
    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

var wpd = wpd || {};
wpd.autoAlign = (function() {
       
    function number_detection(resolve){
        let img =wpd.graphicsWidget.getImagePNG();

        var det_point = {
            x: new Array(), 
            y: new Array(), 
            val: new Array(),
        };         
            Tesseract.recognize(img, {
                tessedit_char_whitelist: "-+0123456789.",
            //}).progress((progress)=>{
                //if(progress.status ==="recognizing text"){
                  //  $('#progress').text(progress.progress*100+"%");
                //}
            }).then((result)=>{
            result.words.forEach(function(w){
                var b = w.bbox;
                if(w.confidence>70){
                    det_point.x.push((b.x0+b.x1)/2)
                    det_point.y.push((b.y0+b.y1)/2)
                    det_point.val.push(w.text)
                } 
            })
            resolve(det_point);
        })
    }

        function occur(arr) {
        /* Getting the value of the most frequent occurence*/
            var occ=0;
            var tocc=0;
            var j=0;
            var max=0;
            while ( j < arr.length ) {   
             for ( var i = 0; i < arr.length; i++ ) {
                if(arr[j]==arr[i]){
                    tocc++;
                 }
                }
            if(tocc>occ){
                max=arr[j];
                occ=tocc;
            }
            tocc=0;
            j++;  
            }
            return [max];
        }
        function cornerValues (det_point){
            var nx = {
                x: new Array(), 
                y: new Array(), 
                val: new Array(),
            };
            var ny = {
                x: new Array(), 
                y: new Array(), 
                val: new Array(),
            };
            cx=wpd.autoAlign.occur(det_point.y) 
           
           //cx is the maximum occurence of a defined position y. 
           //This will likely correspond to the position of each label of x that are aligned on y axis
            cy=occur(det_point.x)
            //same for cy with x position
            for (i =0; i<det_point.y.length;i++){
            //getting the position and values of each label
                if(det_point.y[i]==cx){
                    nx.x.push(det_point.x[i])
                    nx.y.push(det_point.y[i])
                    nx.val.push(det_point.val[i])
                }
                if(det_point.x[i]==cy){
                    ny.x.push(det_point.x[i])
                    ny.y.push(det_point.y[i])
                    ny.val.push(det_point.val[i])
                }
            }
            //taking the first and last elements of the x and y labels
            var xmin= {x: nx.x[0],y: nx.y[0],val: nx.val[0]}
            var xmax= {x: nx.x[nx.x.length-1],y: nx.y[nx.y.length-1],val: nx.val[nx.val.length-1]}
            var ymax= {x: ny.x[0],y: ny.y[0],val: ny.val[0]}
            var ymin= {x: ny.x[ny.x.length-1],y: ny.y[ny.y.length-1],val: ny.val[ny.val.length-1]}
            
            var points=[xmin,xmax,ymin,ymax]
        return points
        }

return {
    number_detection: number_detection,
    cornerValues: cornerValues,
    occur: occur
};
})();