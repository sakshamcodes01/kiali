import * as React from 'react';
import { connect } from 'react-redux';
import { kialiStyle } from 'styles/StyleUtils';
import { KialiIcon } from 'config/KialiIcon';
import { KialiAppState } from 'store/Store';
import { TourStop } from 'components/Tour/TourStop';
import { FocusNode } from 'pages/GraphPF/GraphPF';
import { classes } from 'typestyle';
import { PFColors } from 'components/Pf/PfColors';
import { MeshInfraType, MeshTarget, MeshType } from 'types/Mesh';
import { TargetPanelCommonProps, targetPanelStyle } from './TargetPanelCommon';
import { MeshTourStops } from '../MeshHelpTour';
import { BoxByType } from 'types/Graph';
import { ElementModel, GraphElement } from '@patternfly/react-topology';
import { TargetPanelCluster } from './TargetPanelCluster';
import { TargetPanelNamespace } from './TargetPanelNamespace';
import { TargetPanelNode } from './TargetPanelNode';
import { TargetPanelMesh } from './TargetPanelMesh';
import { meshWideMTLSStatusSelector, minTLSVersionSelector } from 'store/Selectors';
import { NodeData } from '../MeshElems';
import { TargetPanelDataPlane } from './TargetPanelDataPlane';
import { TargetPanelControlPlane } from './TargetPanelControlPlane';

type ReduxProps = {
  kiosk: string;
  meshStatus: string;
  minTLS: string;
};

type TargetPanelProps = ReduxProps &
  TargetPanelCommonProps & {
    isPageVisible: boolean;
    onFocus?: (focusNode: FocusNode) => void;
  };

const mainStyle = kialiStyle({
  fontSize: 'var(--graph-side-panel--font-size)',
  padding: '0',
  position: 'relative',
  backgroundColor: PFColors.BackgroundColor100
});

const expandedStyle = kialiStyle({ height: '100%' });

const collapsedStyle = kialiStyle({
  $nest: {
    [`& > .${targetPanelStyle}`]: {
      display: 'none'
    }
  }
});

const toggleTargetPanelStyle = kialiStyle({
  border: `1px solid ${PFColors.BorderColor100}`,
  backgroundColor: PFColors.BackgroundColor100,
  borderRadius: '3px',
  bottom: 0,
  cursor: 'pointer',
  left: '-1.6em',
  minWidth: '5em',
  position: 'absolute',
  textAlign: 'center',
  transform: 'rotate(-90deg)',
  transformOrigin: 'left top 0'
});

export const TargetPanelComponent: React.FC<TargetPanelProps> = (props: TargetPanelProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  const { target } = props;

  React.useEffect(() => setIsCollapsed(false), [target.elem]);

  const getTargetPanel = (target: MeshTarget): React.ReactNode => {
    const targetType = target.type as MeshType;

    switch (targetType) {
      case 'box': {
        const elem = target.elem as GraphElement<ElementModel, any>;
        const data = elem.getData() as NodeData;
        const boxType: BoxByType = data.isBox as BoxByType;
        switch (boxType) {
          case BoxByType.CLUSTER:
            return (
              <TargetPanelCluster
                duration={props.duration}
                istioAPIEnabled={props.istioAPIEnabled}
                kiosk={props.kiosk}
                refreshInterval={props.refreshInterval}
                target={target}
                updateTime={props.updateTime}
              />
            );
          case BoxByType.NAMESPACE:
            return (
              <TargetPanelNamespace
                duration={props.duration}
                istioAPIEnabled={props.istioAPIEnabled}
                kiosk={props.kiosk}
                refreshInterval={props.refreshInterval}
                target={target}
                updateTime={props.updateTime}
              />
            );
          default:
            return <></>;
        }
      }
      case 'mesh':
        return (
          <TargetPanelMesh
            duration={props.duration}
            istioAPIEnabled={props.istioAPIEnabled}
            kiosk={props.kiosk}
            refreshInterval={props.refreshInterval}
            target={target}
            updateTime={props.updateTime}
          />
        );
      case 'node':
        const elem = target.elem as GraphElement<ElementModel, any>;
        const data = elem.getData() as NodeData;
        switch (data.infraType) {
          case MeshInfraType.ISTIOD:
            return (
              <TargetPanelControlPlane
                duration={props.duration}
                istioAPIEnabled={props.istioAPIEnabled}
                kiosk={props.kiosk}
                meshStatus={props.meshStatus}
                minTLS={props.minTLS}
                refreshInterval={props.refreshInterval}
                target={target}
                updateTime={props.updateTime}
              />
            );
          case MeshInfraType.DATAPLANE:
            return (
              <TargetPanelDataPlane
                duration={props.duration}
                istioAPIEnabled={props.istioAPIEnabled}
                kiosk={props.kiosk}
                refreshInterval={props.refreshInterval}
                target={target}
                updateTime={props.updateTime}
              />
            );
          default:
            return (
              <TargetPanelNode
                duration={props.duration}
                istioAPIEnabled={props.istioAPIEnabled}
                kiosk={props.kiosk}
                refreshInterval={props.refreshInterval}
                target={target}
                updateTime={props.updateTime}
              />
            );
        }
      default:
        return <></>;
    }
  };

  const togglePanel = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  if (!props.isPageVisible || !props.target.elem) {
    return null;
  }

  const mainTopStyle = isCollapsed ? collapsedStyle : expandedStyle;
  // const target: MeshTarget = props.target;
  const tourStops = [MeshTourStops.TargetPanel, MeshTourStops.Mesh];

  return (
    <TourStop info={tourStops}>
      <div id="mesh-target-panel" className={mainStyle}>
        <div className={mainTopStyle}>
          <div className={classes(toggleTargetPanelStyle)} onClick={togglePanel}>
            {isCollapsed ? (
              <>
                <KialiIcon.AngleDoubleUp /> Show
              </>
            ) : (
              <>
                <KialiIcon.AngleDoubleDown /> Hide
              </>
            )}
          </div>
          {getTargetPanel(target)}
        </div>
      </div>
    </TourStop>
  );
};

const mapStateToProps = (state: KialiAppState): ReduxProps => ({
  kiosk: state.globalState.kiosk,
  meshStatus: meshWideMTLSStatusSelector(state),
  minTLS: minTLSVersionSelector(state)
});

export const TargetPanel = connect(mapStateToProps)(TargetPanelComponent);
