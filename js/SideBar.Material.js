/**
 * Created by lucifer on 2016/4/25.
 */
SideBar.Material = function(){

    var currentObject;
    var currentMaterial;
    var container = new UI.Panel();
    container.setDisplay('none');

    var newButton = new UI.Button('新建材质').setWidth('90px').onClick( function( event ) {


    });

    container.add(newButton);

    /**
     * add MultiMaterial Dom
     * @type {UI.CollapsiblePanel}
     */
    var MultiMaterialDom = new UI.CollapsiblePanel();
    MultiMaterialDom.dom.classList.add('MultiMaterial');
    MultiMaterialDom.addStatic(new UI.Text().setValue('复合材质'));
    MultiMaterialDom.add(new UI.Break());

    var materialList = new UI.Outliner();
    materialList.setPaddingTop('20px');
    materialList.setId('outliner');
    materialList.onChange(function(){

        var id = materialList.getValue();
        currentMaterial = currentObject.material.materials[id];
        refreshPhongMaterialDom(currentMaterial, true);
        PhongMaterialDom.setDisplay('');

    });

    MultiMaterialDom.add(materialList);
    container.add(MultiMaterialDom);

    /**
     * add PhongMaterial Dom
     * @type {UI.CollapsiblePanel}
     */
    var PhongMaterialDom = new UI.CollapsiblePanel();
    //  objectMaterial.setPaddingLeft('10px');
    PhongMaterialDom.dom.classList.add('Material');
    PhongMaterialDom.addStatic(new UI.Text().setValue('材质'));
    PhongMaterialDom.add(new UI.Break());

    //material name
    var materialNameRow = new UI.Panel();
    var materialName = new UI.Input().setWidth('150px').setFontSize('12px').onChange(function(){

    });
    materialNameRow.add(new UI.Text('Name').setWidth('90px'));
    materialNameRow.add(materialName);
    PhongMaterialDom.add(materialNameRow);

    //material type
    var materialTypeRow = new UI.Panel();
    var materialType = new UI.Text();
    materialTypeRow.add(new UI.Text('Type').setWidth('90px'));
    materialTypeRow.add(materialType);
    PhongMaterialDom.add(materialTypeRow);

    //color
    var materialColorRow = new UI.Panel();
    var materialColor = new UI.Color().onChange( update );

    materialColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ) );
    materialColorRow.add( materialColor );

    PhongMaterialDom.add( materialColorRow );

    // emissive

    var materialEmissiveRow = new UI.Panel();
    var materialEmissive = new UI.Color().setHexValue( 0x000000 ).onChange( update );

    materialEmissiveRow.add( new UI.Text( 'Emissive' ).setWidth( '90px' ) );
    materialEmissiveRow.add( materialEmissive );

    PhongMaterialDom.add( materialEmissiveRow );

    // specular

    var materialSpecularRow = new UI.Panel();
    var materialSpecular = new UI.Color().setHexValue( 0x111111 ).onChange( update );

    materialSpecularRow.add( new UI.Text( 'Specular' ).setWidth( '90px' ) );
    materialSpecularRow.add( materialSpecular );

    PhongMaterialDom.add( materialSpecularRow );

    // shininess

    var materialShininessRow = new UI.Panel();
    var materialShininess = new UI.Number( 30 ).onChange( update );

    materialShininessRow.add( new UI.Text( 'Shininess' ).setWidth( '90px' ) );
    materialShininessRow.add( materialShininess );

    PhongMaterialDom.add( materialShininessRow );

    // vertex colors

    var materialVertexColorsRow = new UI.Panel();
    var materialVertexColors = new UI.Select().setOptions( {

        0: 'No',
        1: 'Face',
        2: 'Vertex'

    } ).onChange( update );

    materialVertexColorsRow.add( new UI.Text( 'Vertex Colors' ).setWidth( '90px' ) );
    materialVertexColorsRow.add( materialVertexColors );

    PhongMaterialDom.add( materialVertexColorsRow );

    // skinning

    var materialSkinningRow = new UI.Panel();
    var materialSkinning = new UI.Checkbox( false ).onChange( update );

    materialSkinningRow.add( new UI.Text( 'Skinning' ).setWidth( '90px' ) );
    materialSkinningRow.add( materialSkinning );

    PhongMaterialDom.add( materialSkinningRow );

    // map

    var materialMapRow = new UI.Panel();
    var materialMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialMap = new UI.Texture().onChange( update );

    materialMapRow.add( new UI.Text( 'Map' ).setWidth( '90px' ) );
    materialMapRow.add( materialMapEnabled );
    materialMapRow.add( materialMap );

    PhongMaterialDom.add( materialMapRow );

    // alpha map

    var materialAlphaMapRow = new UI.Panel();
    var materialAlphaMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialAlphaMap = new UI.Texture().onChange( update );

    materialAlphaMapRow.add( new UI.Text( 'Alpha Map' ).setWidth( '90px' ) );
    materialAlphaMapRow.add( materialAlphaMapEnabled );
    materialAlphaMapRow.add( materialAlphaMap );

    PhongMaterialDom.add( materialAlphaMapRow );

    // bump map

    var materialBumpMapRow = new UI.Panel();
    var materialBumpMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialBumpMap = new UI.Texture().onChange( update );
    var materialBumpScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

    materialBumpMapRow.add( new UI.Text( 'Bump Map' ).setWidth( '90px' ) );
    materialBumpMapRow.add( materialBumpMapEnabled );
    materialBumpMapRow.add( materialBumpMap );
    materialBumpMapRow.add( materialBumpScale );

    PhongMaterialDom.add( materialBumpMapRow );

    // normal map

    var materialNormalMapRow = new UI.Panel();
    var materialNormalMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialNormalMap = new UI.Texture().onChange( update );

    materialNormalMapRow.add( new UI.Text( 'Normal Map' ).setWidth( '90px' ) );
    materialNormalMapRow.add( materialNormalMapEnabled );
    materialNormalMapRow.add( materialNormalMap );

    PhongMaterialDom.add( materialNormalMapRow );

    // displacement map

    var materialDisplacementMapRow = new UI.Panel();
    var materialDisplacementMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialDisplacementMap = new UI.Texture().onChange( update );
    var materialDisplacementScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

    materialDisplacementMapRow.add( new UI.Text( 'Displace Map' ).setWidth( '90px' ) );
    materialDisplacementMapRow.add( materialDisplacementMapEnabled );
    materialDisplacementMapRow.add( materialDisplacementMap );
    materialDisplacementMapRow.add( materialDisplacementScale );

    PhongMaterialDom.add( materialDisplacementMapRow );

    // specular map

    var materialSpecularMapRow = new UI.Panel();
    var materialSpecularMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialSpecularMap = new UI.Texture().onChange( update );

    materialSpecularMapRow.add( new UI.Text( 'Specular Map' ).setWidth( '90px' ) );
    materialSpecularMapRow.add( materialSpecularMapEnabled );
    materialSpecularMapRow.add( materialSpecularMap );

    PhongMaterialDom.add( materialSpecularMapRow );

    // env map

    var materialEnvMapRow = new UI.Panel();
    var materialEnvMapEnabled = new UI.Checkbox( false ).onChange( update );
    //var materialEnvMap = new UI.Texture( THREE.SphericalReflectionMapping ).onChange( update );
    var materialReflectivity = new UI.Number( 1 ).setRange(0, 1).setWidth( '30px' ).onChange( update );

    materialEnvMapRow.add( new UI.Text( 'Env Map' ).setWidth( '90px' ) );
    materialEnvMapRow.add( materialEnvMapEnabled );
    //materialEnvMapRow.add( materialEnvMap );
    materialEnvMapRow.add( materialReflectivity );

    PhongMaterialDom.add( materialEnvMapRow );

    // light map

    var materialLightMapRow = new UI.Panel();
    var materialLightMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialLightMap = new UI.Texture().onChange( update );

    materialLightMapRow.add( new UI.Text( 'Light Map' ).setWidth( '90px' ) );
    materialLightMapRow.add( materialLightMapEnabled );
    materialLightMapRow.add( materialLightMap );

    PhongMaterialDom.add( materialLightMapRow );

    // ambient occlusion map

    var materialAOMapRow = new UI.Panel();
    var materialAOMapEnabled = new UI.Checkbox( false ).onChange( update );
    var materialAOMap = new UI.Texture().onChange( update );
    var materialAOScale = new UI.Number( 1 ).setRange( 0, 1 ).setWidth( '30px' ).onChange( update );

    materialAOMapRow.add( new UI.Text( 'AO Map' ).setWidth( '90px' ) );
    materialAOMapRow.add( materialAOMapEnabled );
    materialAOMapRow.add( materialAOMap );
    materialAOMapRow.add( materialAOScale );

    PhongMaterialDom.add( materialAOMapRow );

    // side

    var materialSideRow = new UI.Panel();
    var materialSide = new UI.Select().setOptions( {

        0: 'Front',
        1: 'Back',
        2: 'Double'

    } ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

    materialSideRow.add( new UI.Text( 'Side' ).setWidth( '90px' ) );
    materialSideRow.add( materialSide );

    PhongMaterialDom.add( materialSideRow );

    // shading

    var materialShadingRow = new UI.Panel();
    var materialShading = new UI.Select().setOptions( {

        0: 'No',
        1: 'Flat',
        2: 'Smooth'

    } ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

    materialShadingRow.add( new UI.Text( 'Shading' ).setWidth( '90px' ) );
    materialShadingRow.add( materialShading );

    PhongMaterialDom.add( materialShadingRow );

    // blending

    var materialBlendingRow = new UI.Panel();
    var materialBlending = new UI.Select().setOptions( {

        0: 'No',
        1: 'Normal',
        2: 'Additive',
        3: 'Subtractive',
        4: 'Multiply',
        5: 'Custom'

    } ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

    materialBlendingRow.add( new UI.Text( 'Blending' ).setWidth( '90px' ) );
    materialBlendingRow.add( materialBlending );

    PhongMaterialDom.add( materialBlendingRow );

    // opacity

    var materialOpacityRow = new UI.Panel();
    var materialOpacity = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

    materialOpacityRow.add( new UI.Text( 'Opacity' ).setWidth( '90px' ) );
    materialOpacityRow.add( materialOpacity );

    PhongMaterialDom.add( materialOpacityRow );

    // transparent

    var materialTransparentRow = new UI.Panel();
    var materialTransparent = new UI.Checkbox().setLeft( '100px' ).onChange( update );

    materialTransparentRow.add( new UI.Text( 'Transparent' ).setWidth( '90px' ) );
    materialTransparentRow.add( materialTransparent );

    PhongMaterialDom.add( materialTransparentRow );

    // alpha test

    var materialAlphaTestRow = new UI.Panel();
    var materialAlphaTest = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

    materialAlphaTestRow.add( new UI.Text( 'Alpha Test' ).setWidth( '90px' ) );
    materialAlphaTestRow.add( materialAlphaTest );

    PhongMaterialDom.add( materialAlphaTestRow );

    // wireframe

    var materialWireframeRow = new UI.Panel();
    var materialWireframe = new UI.Checkbox( false ).onChange( update );
    var materialWireframeLinewidth = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 100 ).onChange( update );

    materialWireframeRow.add( new UI.Text( 'Wireframe' ).setWidth( '90px' ) );
    materialWireframeRow.add( materialWireframe );
    materialWireframeRow.add( materialWireframeLinewidth );

    PhongMaterialDom.add( materialWireframeRow );


    //material Visible
    var materialVisibleRow = new UI.Panel();
    var materialVisible = new UI.Checkbox().onChange( update );

    materialVisibleRow.add( new UI.Text( 'Visible' ).setWidth( '90px' ) );
    materialVisibleRow.add( materialVisible );

    PhongMaterialDom.add( materialVisibleRow );


    container.add(PhongMaterialDom);

    function update() {

        var object = currentObject;
        var material = currentMaterial;

        var geometry = object.geometry;
        var textureWarning = false;
        var objectHasUvs = false;

        if ( object instanceof THREE.Sprite ) objectHasUvs = true;
        if ( geometry instanceof THREE.Geometry && geometry.faceVertexUvs[ 0 ].length > 0 ) objectHasUvs = true;
        if ( geometry instanceof THREE.BufferGeometry && geometry.attributes.uv !== undefined ) objectHasUvs = true;


        if ( material ) {

            if ( material.visible !== materialVisible.getValue() ) {

                material.visible = materialVisible.getValue();

            }

            if(material.name !== undefined){

                material.name = materialName.getValue();

            }

            if ( material.color !== undefined ) {

                material.color.setHex( materialColor.getHexValue() );

            }

            if ( material.emissive !== undefined ) {

                material.emissive.setHex( materialEmissive.getHexValue() );

            }

            if ( material.specular !== undefined ) {

                material.specular.setHex( materialSpecular.getHexValue() );

            }

            if ( material.shininess !== undefined ) {

                material.shininess = materialShininess.getValue();

            }

            if ( material.vertexColors !== undefined ) {

                var vertexColors = parseInt( materialVertexColors.getValue() );

                if ( material.vertexColors !== vertexColors ) {

                    material.vertexColors = vertexColors;
                    material.needsUpdate = true;

                }

            }

            if ( material.skinning !== undefined ) {

                material.skinning = materialSkinning.getValue();

            }

            if ( material.map !== undefined ) {

                var mapEnabled = materialMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.map = mapEnabled ? materialMap.getValue() : null;
                    material.needsUpdate = true;

                } else {

                    if ( mapEnabled ) textureWarning = true;

                }

            }

            if ( material.alphaMap !== undefined ) {

                var mapEnabled = materialAlphaMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.alphaMap = mapEnabled ? materialAlphaMap.getValue() : null;
                    material.needsUpdate = true;

                } else {

                    if ( mapEnabled ) textureWarning = true;

                }

            }

            if ( material.bumpMap !== undefined ) {

                var bumpMapEnabled = materialBumpMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.bumpMap = bumpMapEnabled ? materialBumpMap.getValue() : null;
                    material.bumpScale = materialBumpScale.getValue();
                    material.needsUpdate = true;

                } else {

                    if ( bumpMapEnabled ) textureWarning = true;

                }

            }

            if ( material.normalMap !== undefined ) {

                var normalMapEnabled = materialNormalMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
                    material.needsUpdate = true;

                } else {

                    if ( normalMapEnabled ) textureWarning = true;

                }

            }

            if ( material.displacementMap !== undefined ) {

                var displacementMapEnabled = materialDisplacementMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.displacementMap = displacementMapEnabled ? materialDisplacementMap.getValue() : null;
                    material.displacementScale = materialDisplacementScale.getValue();
                    material.needsUpdate = true;

                } else {

                    if ( displacementMapEnabled ) textureWarning = true;

                }

            }

            if ( material.specularMap !== undefined ) {

                var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
                    material.needsUpdate = true;

                } else {

                    if ( specularMapEnabled ) textureWarning = true;

                }

            }

            if ( material.envMap !== undefined ) {

                var envMapEnabled = materialEnvMapEnabled.getValue() === true;
                var reflectivity = materialReflectivity.getValue();
                //material.envMap = envMapEnabled ? materialEnvMap.getValue() : null;
                if(envMapEnabled && currentObject.cubeCamera !== undefined) {

                    if(currentObject.userData.cubeCamera.materials[material.uuid] === undefined) {
                        currentObject.userData.cubeCamera.materials[material.uuid] = reflectivity;
                        material.envMap = currentObject.cubeCamera.renderTarget;
                    }

                }else if(!envMapEnabled){

                    if ( currentObject.userData && currentObject.userData.cubeCamera && currentObject.userData.cubeCamera.materials !== undefined ){

                        delete currentObject.userData.cubeCamera.materials[material.uuid];
                        material.envMap = null;

                    }

                }
                
                if(currentObject.userData && currentObject.userData.cubeCamera && currentObject.userData.cubeCamera.materials[material.uuid] !== undefined) {

                    material.reflectivity = reflectivity;
                    currentObject.userData.cubeCamera.materials[material.uuid] = reflectivity;

                }
                material.needsUpdate = true;

            }


            if ( material.lightMap !== undefined ) {

                var lightMapEnabled = materialLightMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.lightMap = lightMapEnabled ? materialLightMap.getValue() : null;
                    material.needsUpdate = true;

                } else {

                    if ( lightMapEnabled ) textureWarning = true;

                }

            }

            if ( material.aoMap !== undefined ) {

                var aoMapEnabled = materialAOMapEnabled.getValue() === true;

                if ( objectHasUvs ) {

                    material.aoMap = aoMapEnabled ? materialAOMap.getValue() : null;
                    material.aoMapIntensity = materialAOScale.getValue();
                    material.needsUpdate = true;

                } else {

                    if ( aoMapEnabled ) textureWarning = true;

                }

            }

            if ( material.side !== undefined ) {

                material.side = parseInt( materialSide.getValue() );

            }

            if ( material.shading !== undefined ) {

                material.shading = parseInt( materialShading.getValue() );

            }

            if ( material.blending !== undefined ) {

                material.blending = parseInt( materialBlending.getValue() );

            }

            if ( material.opacity !== undefined ) {

                material.opacity = materialOpacity.getValue();

            }

            if ( material.transparent !== undefined ) {

                material.transparent = materialTransparent.getValue();

            }

            if ( material.alphaTest !== undefined ) {

                material.alphaTest = materialAlphaTest.getValue();

            }

            if ( material.wireframe !== undefined ) {

                material.wireframe = materialWireframe.getValue();

            }

            if ( material.wireframeLinewidth !== undefined ) {

                material.wireframeLinewidth = materialWireframeLinewidth.getValue();

            }

            refreshPhongMaterialDom(material, false);


        }

        if ( textureWarning ) {

            console.warn( "Can't set texture, model doesn't have texture coordinates" );

        }

    };

    function setRowVisibility() {

        var properties = {
            'name': materialNameRow,
            'color': materialColorRow,
            //'roughness': materialRoughnessRow,
            //'metalness': materialMetalnessRow,
            'emissive': materialEmissiveRow,
            'specular': materialSpecularRow,
            'shininess': materialShininessRow,
            //'vertexShader': materialProgramRow,
            'vertexColors': materialVertexColorsRow,
            'skinning': materialSkinningRow,
            'map': materialMapRow,
            'alphaMap': materialAlphaMapRow,
            'bumpMap': materialBumpMapRow,
            'normalMap': materialNormalMapRow,
            'displacementMap': materialDisplacementMapRow,
            //'roughnessMap': materialRoughnessMapRow,
            //'metalnessMap': materialMetalnessMapRow,
            'specularMap': materialSpecularMapRow,
            'envMap': materialEnvMapRow,
            'lightMap': materialLightMapRow,
            'aoMap': materialAOMapRow,
            //'emissiveMap': materialEmissiveMapRow,
            'side': materialSideRow,
            'shading': materialShadingRow,
            'blending': materialBlendingRow,
            'opacity': materialOpacityRow,
            'transparent': materialTransparentRow,
            'alphaTest': materialAlphaTestRow,
            'wireframe': materialWireframeRow
        };

        var material = currentMaterial;

        for ( var property in properties ) {

            properties[ property ].setDisplay( material[ property ] !== undefined ? '' : 'none' );

        }

    }

    function refreshPhongMaterialDom(material, resetTextureSelectors){

        if ( material.name !== undefined ) {

            materialName.setValue( material.name );

        }

        materialType.setValue( material.type );

        if ( material.color !== undefined ) {

            materialColor.setHexValue( material.color.getHexString() );

        }

        if ( material.emissive !== undefined ) {

            materialEmissive.setHexValue( material.emissive.getHexString() );

        }

        if ( material.specular !== undefined ) {

            materialSpecular.setHexValue( material.specular.getHexString() );

        }

        if ( material.shininess !== undefined ) {

            materialShininess.setValue( material.shininess );

        }

        if ( material.vertexColors !== undefined ) {

            materialVertexColors.setValue( material.vertexColors );

        }

        if ( material.skinning !== undefined ) {

            materialSkinning.setValue( material.skinning );

        }

        if ( material.map !== undefined ) {

            materialMapEnabled.setValue( material.map !== null );

            if ( material.map !== null || resetTextureSelectors ) {

                materialMap.setValue( material.map );

            }

        }

        if ( material.alphaMap !== undefined ) {

            materialAlphaMapEnabled.setValue( material.alphaMap !== null );

            if ( material.alphaMap !== null || resetTextureSelectors ) {

                materialAlphaMap.setValue( material.alphaMap );

            }

        }

        if ( material.bumpMap !== undefined ) {

            materialBumpMapEnabled.setValue( material.bumpMap !== null );

            if ( material.bumpMap !== null || resetTextureSelectors ) {

                materialBumpMap.setValue( material.bumpMap );

            }

            materialBumpScale.setValue( material.bumpScale );

        }

        if ( material.normalMap !== undefined ) {

            materialNormalMapEnabled.setValue( material.normalMap !== null );

            if ( material.normalMap !== null || resetTextureSelectors ) {

                materialNormalMap.setValue( material.normalMap );

            }

        }

        if ( material.displacementMap !== undefined ) {

            materialDisplacementMapEnabled.setValue( material.displacementMap !== null );

            if ( material.displacementMap !== null || resetTextureSelectors ) {

                materialDisplacementMap.setValue( material.displacementMap );

            }

            materialDisplacementScale.setValue( material.displacementScale );

        }

        if ( material.specularMap !== undefined ) {

            materialSpecularMapEnabled.setValue( material.specularMap !== null );

            if ( material.specularMap !== null || resetTextureSelectors ) {

                materialSpecularMap.setValue( material.specularMap );

            }

        }

        if ( material.envMap !== undefined ) {

            materialEnvMapEnabled.setValue( material.envMap !== null );

            if ( material.envMap !== null || resetTextureSelectors ) {

               // materialEnvMap.setValue( material.envMap );

            }

            materialReflectivity.setValue( material.reflectivity );

        }

        if ( material.lightMap !== undefined ) {

            materialLightMapEnabled.setValue( material.lightMap !== null );

            if ( material.lightMap !== null || resetTextureSelectors ) {

                materialLightMap.setValue( material.lightMap );

            }

        }

        if ( material.aoMap !== undefined ) {

            materialAOMapEnabled.setValue( material.aoMap !== null );

            if ( material.aoMap !== null || resetTextureSelectors ) {

                materialAOMap.setValue( material.aoMap );

            }

            materialAOScale.setValue( material.aoMapIntensity );

        }

        if ( material.side !== undefined ) {

            materialSide.setValue( material.side );

        }

        if ( material.shading !== undefined ) {

            materialShading.setValue( material.shading );

        }

        if ( material.blending !== undefined ) {

            materialBlending.setValue( material.blending );

        }

        if ( material.opacity !== undefined ) {

            materialOpacity.setValue( material.opacity );

        }

        if ( material.transparent !== undefined ) {

            materialTransparent.setValue( material.transparent );

        }

        if ( material.alphaTest !== undefined ) {

            materialAlphaTest.setValue( material.alphaTest );

        }

        if ( material.wireframe !== undefined ) {

            materialWireframe.setValue( material.wireframe );

        }

        if ( material.wireframeLinewidth !== undefined ) {

            materialWireframeLinewidth.setValue( material.wireframeLinewidth );

        }

        if (material.visible !== undefined ) {

            materialVisible.setValue( material.visible );
            
        }

        setRowVisibility(material);

    }

    function refreshMultiMaterialDom(material){

        var multiMaterialOption = [];
        var currentMultiMaterial = material;
        for(var i = 0; i < material.materials.length; i++){
            var materialRow = new UI.Panel();
            var materialObject = {};
            materialObject.static = true;
            materialObject.value = i;
            materialObject.html = '<span class="type' + material.materials[i].type + '"></span>' + material.materials[i].name;
            multiMaterialOption.push(materialObject);

        }

        materialList.setOptions(multiMaterialOption);
        return multiMaterialOption;
         
    }

    function refresh(object){

        if ( object && object.material ) {

            var objectChanged = object !== currentObject;
            currentObject = object;

            var material = currentObject.material;
            if(material instanceof THREE.MultiMaterial){

                MultiMaterialDom.setDisplay('');
                PhongMaterialDom.setDisplay('none');
                refreshMultiMaterialDom(material);

            }else {

                MultiMaterialDom.setDisplay('none');
                PhongMaterialDom.setDisplay('');
                currentMaterial = material;
                refreshPhongMaterialDom(material, true);

            }
            container.setDisplay( '' );

        } else {

            currentObject = null;
            container.setDisplay( 'none' );

        }
    }

    return {
        dom:container,
        refresh:refresh
    };
};
