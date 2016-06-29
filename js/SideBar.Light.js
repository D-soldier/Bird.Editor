/**
 * Created by lucifer on 2016/4/25.
 */
SideBar.Light = function(){

    var currentObject;
    function update(){

        var object = currentObject;

        if ( object !== null ) {


            if ( object.intensity !== undefined && Math.abs( object.intensity - objectIntensity.getValue() ) >= 0.01 ) {

                object.intensity = objectIntensity.getValue();

            }

            if ( object.color !== undefined && object.color.getHex() !== objectColor.getHexValue() ) {

                var color = objectColor.getHexValue();
                object.color.set(color);

            }

            if ( object.groundColor !== undefined && object.groundColor.getHex() !== objectGroundColor.getHexValue() ) {

                object.groundColor.set(objectGroundColor.getHexValue());

            }

            if ( object.distance !== undefined && Math.abs( object.distance - objectDistance.getValue() ) >= 0.01 ) {

                object.distance = objectDistance.getValue();

            }

            if ( object.decay !== undefined && Math.abs( object.decay - objectDecay.getValue() ) >= 0.01 ) {

                object.decay = objectDecay.getValue();

            }

            if ( object.castShadow !== undefined && object.castShadow !== objectCastShadow.getValue() ) {

                object.castShadow = objectCastShadow.getValue();

            }

            if ( object.receiveShadow !== undefined && object.receiveShadow !== objectReceiveShadow.getValue() ) {

                object.receiveShadow = objectReceiveShadow.getValue();
                object.material.needsUpdate = true;

            }

            if ( object.shadow !== undefined ) {

                if ( object.shadow.radius !== objectShadowRadius.getValue() ) {

                    object.shadow.radius = objectShadowRadius.getValue();

                }

            }

        }

    }
    var container = new UI.CollapsiblePanel();
    container.dom.classList.add('Light');
    container.addStatic(new UI.Text().setValue('灯光'));
    container.add(new UI.Break());

    //target
    var objectTargetRow = new UI.Panel();
    var objectTargetX = new UI.Number().setWidth( '50px' ).onChange( update );
    var objectTargetY = new UI.Number().setWidth( '50px' ).onChange( update );
    var objectTargetZ = new UI.Number().setWidth( '50px' ).onChange( update );

    objectTargetRow.add( new UI.Text( 'Target' ).setWidth( '90px' ) );
    objectTargetRow.add( objectTargetX, objectTargetY, objectTargetZ );

    container.add( objectTargetRow );

    // Color
    var objectColorRow = new UI.Panel();
    var objectColor = new UI.Color().onChange(update);
    objectColorRow.add(new UI.Text('Color').setWidth('90px'));
    objectColorRow.add(objectColor);
    container.add(objectColorRow);

    // GroundColor
    var objectGroundColorRow = new UI.Panel();
    var objectGroundColor = new UI.Color().onChange( update );

    objectGroundColorRow.add( new UI.Text( 'Ground color' ).setWidth( '90px' ) );
    objectGroundColorRow.add( objectGroundColor );

    container.add( objectGroundColorRow );

    // distance

    var objectDistanceRow = new UI.Panel();
    var objectDistance = new UI.Number().setRange( 0, Infinity ).onChange( update );

    objectDistanceRow.add( new UI.Text( 'Distance' ).setWidth( '90px' ) );
    objectDistanceRow.add( objectDistance );

    container.add( objectDistanceRow );

    // Intensity
    var objectIntensityRow = new UI.Panel();
    var objectIntensity = new UI.Number().setRange( 0, Infinity ).onChange( update );

    objectIntensityRow.add( new UI.Text( 'Intensity' ).setWidth( '90px' ) );
    objectIntensityRow.add( objectIntensity );

    container.add( objectIntensityRow );

    // decay

    var objectDecayRow = new UI.Panel();
    var objectDecay = new UI.Number().setRange( 0, Infinity ).onChange( update );

    objectDecayRow.add( new UI.Text( 'Decay' ).setWidth( '90px' ) );
    objectDecayRow.add( objectDecay );

    container.add( objectDecayRow );

    // shadow

    var objectShadowRow = new UI.Panel();

    objectShadowRow.add( new UI.Text( 'Shadow' ).setWidth( '90px' ) );

    var objectCastShadow = new UI.THREE.Boolean( false, 'cast' ).onChange( update );
    objectShadowRow.add( objectCastShadow );

    var objectReceiveShadow = new UI.THREE.Boolean( false, 'receive' ).onChange( update );
    objectShadowRow.add( objectReceiveShadow );

    var objectShadowRadius = new UI.Number( 1 ).onChange( update );
    objectShadowRow.add( objectShadowRadius );

    container.add( objectShadowRow );


    function updateRows( object ) {

        var properties = {
            // 'parent': objectParentRow,
            //'fov': objectFovRow,
            //'near': objectNearRow,
            //'far': objectFarRow,
            'intensity': objectIntensityRow,
            'color': objectColorRow,
            'groundColor': objectGroundColorRow,
            'distance' : objectDistanceRow,
            //'angle' : objectAngleRow,
            //'penumbra' : objectPenumbraRow,
            'decay' : objectDecayRow,
            'castShadow' : objectShadowRow,
            'receiveShadow' : objectReceiveShadow,
            'shadow': objectShadowRadius
        };

        for ( var property in properties ) {

            properties[ property ].setDisplay( object[ property ] !== undefined ? '' : 'none' );

        }

    }

    function refresh(node){


        var isLightNode = /Light/.test(node.type);
        if(!isLightNode){
            container.setDisplay('none');
            return;
        }
        container.setDisplay('');
        currentObject = node;

        if ( currentObject.intensity !== undefined ) {

            objectIntensity.setValue( currentObject.intensity );

        }

        if ( currentObject.color !== undefined ) {

            objectColor.setHexValue( currentObject.color.getHexString() );

        }

        if ( currentObject.groundColor !== undefined ) {

            objectGroundColor.setHexValue( currentObject.groundColor.getHexString() );

        }

        if ( currentObject.distance !== undefined ) {

            objectDistance.setValue( currentObject.distance );

        }

        if ( currentObject.decay !== undefined ) {

            objectDecay.setValue( currentObject.decay );

        }

        if ( currentObject.castShadow !== undefined ) {

            objectCastShadow.setValue( currentObject.castShadow );

        }

        if ( currentObject.receiveShadow !== undefined ) {

            objectReceiveShadow.setValue( currentObject.receiveShadow );

        }

        if ( currentObject.shadow !== undefined ) {

            objectShadowRadius.setValue( currentObject.shadow.radius );

        }


        updateRows( currentObject );
    }

    container.setDisplay('none');

    return {
        dom:container,
        refresh:refresh
    };

};