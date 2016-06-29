/**
 * Created by Administrator on 2016/5/3.
 */
var exportJson = function(){

    var scope = this;

    this.bufferDatas = [];
    this.buffers = [];
    this.bufferLong  = 0;

    this.exportFile = function( filepath, json, objectName ) {

        json.metadata.fileVersion = 1;

        var zip = new JSZip();

        var i, l, offset;

        if ( json.geometries && json.geometries.length ) {

            extractBufferAttributes( json.geometries,  json.buffers );

            var buffer = new Buffer( scope.bufferLong );
            for ( i = 0, offset = 0, l = scope.bufferDatas.length; i < l; i ++ ) {

                scope.bufferDatas[i].copy( buffer, offset );
                offset += scope.bufferDatas[i].length;

            }

            zip.file( objectName + '.bin', buffer, { binary: true } );

            json.buffers = scope.buffers;

        }

        zip.file( objectName + '.json', JsonToString( json ) );

        var zipfolder = zip.generate( { type: "nodebuffer", compression: "DEFLATE" } );
        var filePath = filepath +'/' + objectName + '.zip';
        fs.writeFile( filePath, zipfolder, function ( err ) {

            if (err) throw err;

            scope.bufferDatas = [];
            scope.buffers = [];
            scope.bufferLong  = 0;
        
        });

    };

    function extractBufferAttributes ( geometries, buffers ) {

        var stride, count, attributes, bufferID, bufferData, interleavedBuffer;
        var i, j, l, m, offset;
        var position, normal, uv, uv2;
        
        for ( i = 0, l = geometries.length; i < l; i ++ ) {

            attributes = geometries[i].data.attributes;
            
            if ( ! attributes.position ) { 
        
                alert('error position absence!!!' + geometry.uuid );
                return; 

            }

            if ( ! attributes.position.buffer ) {

                count = attributes.position.array.length / 3;

                // 删除color属性（需要考虑有些使用到color的情况）
                if ( attributes.color !== undefined ) { delete attributes.color; }
                

                // 计算stride和新的bufferID
                stride = 0;
                bufferID = THREE.Math.generateUUID();
                if ( attributes.position ) { 
         
                    position = {
                        buffer: bufferID,
                        itemSize: 3,
                        offset: stride
                    };
                    stride += 3;

                }
                if ( attributes.normal ) { 
                    
                    normal = {
                        buffer: bufferID,
                        itemSize: 3,
                        offset: stride
                    };
                    stride += 3;

                }
                if ( attributes.uv ) { 
                    
                    uv = {
                        buffer: bufferID,
                        itemSize: 2,
                        offset: stride
                    };
                    stride += 2;
                    
                }
                if ( attributes.uv2 ) { 
                    
                    uv2 = {
                        buffer: bufferID,
                        itemSize: 2,
                        offset: stride
                    };
                    stride += 2;
                    
                }
                
                // 构建交叉存储的buffer
                bufferData = new Buffer( 4 * stride * count );
                for ( j = 0, offset = 0; j < count; j ++ ) {

                    if ( attributes.position ) {

                        bufferData.writeFloatLE( attributes.position.array[3*j], offset);
                        offset += 4;
                        bufferData.writeFloatLE( attributes.position.array[3*j+1], offset);
                        offset += 4;
                        bufferData.writeFloatLE( attributes.position.array[3*j+2], offset);
                        offset += 4;

                    }
                    if ( attributes.normal ) {

                        bufferData.writeFloatLE( attributes.normal.array[3*j], offset);
                        offset += 4;
                        bufferData.writeFloatLE( attributes.normal.array[3*j+1], offset);
                        offset += 4;
                        bufferData.writeFloatLE( attributes.normal.array[3*j+2], offset);
                        offset += 4;

                    }
                    if ( attributes.uv ) {

                        bufferData.writeFloatLE( attributes.uv.array[2*j], offset);
                        offset += 4;
                        bufferData.writeFloatLE( attributes.uv.array[2*j+1], offset);
                        offset += 4;

                    }
                    if ( attributes.uv2 ) {

                        bufferData.writeFloatLE( attributes.uv2.array[2*j], offset);
                        offset += 4;
                        bufferData.writeFloatLE( attributes.uv2.array[2*j+1], offset);
                        offset += 4;

                    }

                }

                scope.bufferDatas.push( bufferData );

                scope.buffers.push( {
                    id: bufferID,
                    offset: scope.bufferLong,
                    stride: stride,
                    count: count
                } );
                scope.bufferLong += bufferData.length;

                if ( attributes.position ) { attributes.position = position; }
                if ( attributes.normal ) { attributes.normal = normal; }
                if ( attributes.uv ) { attributes.uv = uv; }
                if ( attributes.uv2 ) { attributes.uv2 = uv2; }

            }

        }

        if ( buffers ) {

            for ( i = 0, l = buffers.length; i < l; i ++ ) {

                if ( buffers[ i ].count === undefined ) {

                    interleavedBuffer = buffers[ i ];

                    bufferData = new Buffer( interleavedBuffer.array.length * 4 );
                    offset = 0;
                    for ( j = 0, m = interleavedBuffer.array.length; j < m; j ++ ) {

                        bufferData.writeFloatLE( interleavedBuffer.array[j], offset);
                        offset += 4;
                    }

                    scope.bufferDatas.push( bufferData );

                    scope.buffers.push( {
                        id: interleavedBuffer.id,
                        offset: scope.bufferLong,
                        stride: interleavedBuffer.stride,
                        count: interleavedBuffer.array.length / interleavedBuffer.stride
                    } );
                    scope.bufferLong += bufferData.length;
                }
            }

        }

    }


    function JsonToString ( json ) {

        var outPut = "";
        try{

            outPut = JSON.stringify( json, null, '\t');
            outPut = outPut.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
        
        } catch(e) {

            outPut = JSON.stringify( json );
        }

        return outPut;

    }

};




