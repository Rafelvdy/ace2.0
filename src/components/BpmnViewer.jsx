// React hooks for managing component lifecycle and references
import { useEffect, useRef } from "react";
// BPMN.js library for rendering Business Process Model and Notation diagrams
import BpmnJS from "bpmn-js";

/**
 * BpmnViewer Component
 * 
 * A React component that renders BPMN (Business Process Model and Notation) diagrams
 * from XML data and provides interaction capabilities.
 */

const BpmnViewer = ({ xml, onElementClick }) => {
    // Reference to the DOM container where the BPMN diagram will be rendered
    const containerRef = useRef(null);
    // Reference to the BPMN.js viewer instance (persists across re-renders)
    const viewerRef = useRef(null);

    // Effect hook runs when xml or onElementClick props change
    useEffect(() => {
        // Initialize BPMN viewer only once (lazy initialization)
        if (!viewerRef.current) {
            viewerRef.current = new BpmnJS({
                container: containerRef.current, // DOM element to render the diagram
                width: "100%",                   // Full width of container
                height: "600px",                 // Fixed height for diagram area
            });
        }

        // Get reference to the initialized viewer instance
        const viewer = viewerRef.current;

        // Import and render BPMN XML if provided
        if (xml) {
            viewer.importXML(xml)
                .then(({ warnings }) => {
                    // Log any non-critical warnings from the BPMN import process
                    if (warnings.length) {
                        console.warn("BPMN warnings:", warnings);
                    }

                    // Automatically fit the entire diagram within the viewport for optimal viewing
                    viewer.get('canvas').zoom('fit-viewport');
                })
                .catch((err) => {
                    // Log critical errors that prevent diagram rendering
                    console.error("BPMN import error:", err);
                });
        }

        // Set up click event handling if callback is provided
        if (onElementClick) {
            // Get the event bus from BPMN.js to listen for user interactions
            const eventBus = viewer.get('eventBus');
            // Register click event listener for diagram elements (shapes, connections, etc.)
            eventBus.on('element.click', (event) => {
                // Call the provided callback with the clicked element data
                onElementClick(event.element);
            });
        }

        // This cleanup functionruns when component unmounts or dependencies change
        return () => {
            // Properly destroy the BPMN viewer instance to prevent memory leaks
            if (viewerRef.current) {
                viewerRef.current.destroy();
            }
        };
    }, [xml, onElementClick]); // Re-run effect when XML content or click handler changes

    // Render the container div where BPMN diagram will be displayed
    return (
        <div
            ref={containerRef}                              
            className="border border-gray-300 rounded-lg"  
            style={{ height: "600px" }}                    
        />
    )
}

// Export component for use in other parts of the application
export default BpmnViewer;