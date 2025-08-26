import { useEffect, useRef } from "react";
import BpmnJS from "bpmn-js";

const BpmnViewer = ({ xml, onElementClick }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!viewerRef.current) {
            viewerRef.current = new BpmnJS({
                container: containerRef.current,
                width: "100%",
                height: "600px",
            });
        }

        const viewer = viewerRef.current;

        if (xml) {
            viewer.importXML(xml)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.warn("BPMN warnings:", warnings);
                    }

                    viewer.get('canvas').zoom('fit-viewport');
                })
                .catch((err) => {
                    console.error("BPMN import error:", err);
                });
        }

        if (onElementClick) {
            const eventBus = viewer.get('eventBus');
            eventBus.on('element.click', (event) => {
                onElementClick(event.element);
            });
        }

        return () => {
            if (viewer.current) {
                viewerRef.current.destroy();
            }
        };
    }, [xml, onElementClick]);

    return (
        <div
            ref={containerRef}
            className="border border-gray-300 rounded-lg"
            style={{ height: "600px" }}
        />
    )
}

export default BpmnViewer;