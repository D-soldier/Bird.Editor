/**
 * Created by lucifer on 2016/5/3.
 */
SideBar.WallDirection = function(){

    var currentObject;
    var walldirection;

    function update(){

        var object = currentObject;

        if ( object !== null ) {

            var newDirection = new THREE.Vector3(objectDirectionX.getValue(), objectDirectionY.getValue(), objectDirectionZ.getValue());
            newDirection.normalize();
            object.userData.direction.direction = newDirection;
            if(walldirection !== null){
                walldirection.setDirection(object.userData.direction.direction);
                refreshData(currentObject.userData.direction.direction);
            }

        }
    }
    var container = new UI.CollapsiblePanel();
    container.dom.classList.add('walldirection');
    container.addStatic(new UI.Text().setValue('墙体法线'));
    container.add(new UI.Break());

    // Position
    var objectPositionRow = new UI.Panel();
    var objectDirectionX = new UI.Number().setWidth( '50px' ).onChange( update );
    var objectDirectionY = new UI.Number().setWidth( '50px' ).onChange( update );
    var objectDirectionZ = new UI.Number().setWidth( '50px' ).onChange( update );

    objectPositionRow.add( new UI.Text( 'Direction' ).setWidth( '90px' ) );
    objectPositionRow.add( objectDirectionX, objectDirectionY, objectDirectionZ );

    container.add( objectPositionRow );

    var reverseDirectionRow = new UI.Button("法线反转");


    reverseDirectionRow.onClick(function(){

        currentObject.userData.direction.direction.multiplyScalar(-1);
        if(walldirection !== null){
            walldirection.setDirection(currentObject.userData.direction.direction);
            refreshData(currentObject.userData.direction.direction);
        }
    });

    container.add(reverseDirectionRow);

    function refresh(node, arror){

        var isOutSideWall = /hide_wall_/.test(node.name);
        if(!isOutSideWall){
            container.setDisplay('none');
            return;
        }
        walldirection = arror !== undefined? arror : null;
        container.setDisplay('');
        currentObject = node;

        if(currentObject.userData && currentObject.userData.direction.direction) {
            refreshData(currentObject.userData.direction.direction);
        }
    }

    function refreshData(direction){

        objectDirectionX.setValue(direction.x);
        objectDirectionY.setValue(direction.y);
        objectDirectionZ.setValue(direction.z);

    }

    return {
        dom:container,
        refresh:refresh
    };
};