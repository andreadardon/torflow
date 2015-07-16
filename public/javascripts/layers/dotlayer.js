/**
* Copyright © 2015 Uncharted Software Inc.
*
* Property of Uncharted™, formerly Oculus Info Inc.
* http://uncharted.software/
*
* Released under the MIT License.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of
* this software and associated documentation files (the "Software"), to deal in
* the Software without restriction, including without limitation the rights to
* use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is furnished to do
* so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

var Config = require('../config');
var DotLayer = L.CanvasLayer.extend({

    _ctx : null,
    _initialized : false,

    add : function(pos) {
        if (!this._initialized) {
            return;
        }
        var point = this._map.latLngToContainerPoint(pos.latLng);
        var tailDirectionX = 0, tailDirectionY = 0;
        if (pos.source && pos.source.latLng) {
            var sourcePoint = this._map.latLngToContainerPoint(pos.source.latLng);

            tailDirectionX = sourcePoint.x - point.x;
            tailDirectionY = sourcePoint.y - point.y;
            var dirMagnitude = Math.sqrt(tailDirectionX * tailDirectionX + tailDirectionY * tailDirectionY);
            tailDirectionX /= dirMagnitude;
            tailDirectionY /= dirMagnitude;
        }

        // Draw 10 line segments
        var head = {
            x: point.x,
            y: point.y
        };

        if (pos.fill) {
            this.fill(pos.fill);
        }

        var tailSegmentLength = Config.dot.tailSegmentLength;
        var tailSegments = Config.dot.tailSegments;
        this._ctx.strokeWidth = Config.dot.thickness + 'px';
        for (var i = 0; i < tailSegments; i++) {
            this._ctx.strokeStyle = 'rgba(' +
                                        this._fillR + ',' +
                                        this._fillG + ',' +
                                        this._fillB + ',' +
                                        (1.0 - (i/tailSegments)) + ')';

            this._ctx.beginPath();
            this._ctx.moveTo(head.x,head.y);
            this._ctx.lineTo(head.x + (tailDirectionX*tailSegmentLength), head.y + (tailDirectionY*tailSegmentLength));
            this._ctx.stroke();
            head.x += (tailDirectionX*tailSegmentLength);
            head.y += (tailDirectionY*tailSegmentLength);
        }

        this._ctx.fillRect(point.x - Config.dot.thickness/2,point.y - Config.dot.thickness/2,Config.dot.thickness,Config.dot.thickness);
    },

    clear : function() {
        this._ctx.clearRect(0, 0, this._width, this._height);
    },

    render: function() {
        if (!this._initialized) {
            var canvas = this.getCanvas();
            this._ctx = canvas.getContext('2d');
            this._width = canvas.width;
            this._height = canvas.height;

            this.clear();

            this._ctx.fillStyle = this._fillStyle || 'white';
            this._initialized = true;
        }
    }
});

DotLayer.prototype = _.extend(DotLayer.prototype,{
    fillStyle : function(style) {
        this._fillStyle = style;
        return this;
    },
    fill : function(clr) {
        this._fillR = clr.r;
        this._fillG = clr.g;
        this._fillB = clr.b;
    }
});

module.exports = DotLayer;