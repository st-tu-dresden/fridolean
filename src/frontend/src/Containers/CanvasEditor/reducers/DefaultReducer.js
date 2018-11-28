const defaultOptions={enableMarkdown: true}

/**
 * default state : everything is empty - used for tests and debugs
 * @deprecated
 */
export const defaultBMC = {
  store : {
    volatile : {pending : [], notdefinedID_id: 'exampleID-0'},
    persistent : {
      tags: {},
      canvases : {
        'exampleID-0' : {
          _id : 'exampleID-0',
          tags: [],
          options: {...defaultOptions},
          canvasType : 'BUSINESS_MODEL',
          buildingBlocks : {
            b0: {_id: 'b0', title: 'Key Partners', type: 'data', layoutEntry:{}, entries:{}},
            b1: {_id: 'b1', title: 'Key Activities', type: 'data', layoutEntry:{}, entries:{}},
            b2: {_id: 'b2', title: 'Key Resources', type: 'data', layoutEntry:{}, entries:{}},
            b3: {_id: 'b3', title: 'Customer Relationships', type: 'data', layoutEntry:{}, entries:{}},
            b4: {_id: 'b4', title: 'Channels', type: 'data', layoutEntry:{}, entries:{}},
            b5: {_id: 'b5', title: 'Customer Segments', type: 'target', layoutEntry:{}, entries:{}},
            b6: {_id: 'b6', title: 'Cost Structure', type: 'data', layoutEntry:{}, entries:{}},
            b7: {_id: 'b7', title: 'Revenue Streams', type: 'data', layoutEntry:{}, entries:{}},
            b8: {_id: 'b8', title: 'Value Propositions', type: 'link', layoutEntry:{}, entries:{}}
          }
        },
        'exampleID-1' : {
          _id: 'exampleID-1',
          tags: [],
          options: {...defaultOptions},
          canvasType: 'LEAN',
          buildingBlocks : {
            b0: {_id: 'b0', title: 'Problem', type: 'data', layoutEntry:{}, entries:{}},
            b1: {_id: 'b1', title: 'Solution', type: 'data', layoutEntry:{}, entries:{}},
            b2: {_id: 'b2', title: 'Key Metrics', type: 'data', layoutEntry:{}, entries:{}},
            b3: {_id: 'b3', title: 'Unique Value Proposition', type: 'data', layoutEntry:{}, entries:{}},
            b4: {_id: 'b4', title: 'Unfair Advantage', type: 'data', layoutEntry:{}, entries:{}},
            b5: {_id: 'b5', title: 'Channels', type: 'data', layoutEntry:{}, entries:{}},
            b6: {_id: 'b6', title: 'Customer Segment', type: 'data', layoutEntry:{}, entries:{}},
            b7: {_id: 'b7', title: 'Cost Structure', type: 'data', layoutEntry:{}, entries:{}},
            b8: {_id: 'b8', title: 'Revenue Streams', type: 'data', layoutEntry:{}, entries:{}},
          }
        },
        'exampleID-2' : {
          _id : 'exampleID-2',
          tags: [],
          options: {...defaultOptions},
          canvasType : 'VALUE_PROPOSITION',
          buildingBlocks : {
            b0: {_id: 'b0', title: 'Products & Services', type: 'data', layoutEntry:{}, entries:{}},
            b1: {_id: 'b1', title: 'Gain Creators', type: 'data', layoutEntry:{}, entries:{}},
            b2: {_id: 'b2', title: 'Pain Relievers', type: 'data', layoutEntry:{}, entries:{}},
            b3: {_id: 'b3', title: 'Gains', type: 'data', layoutEntry:{}, entries:{}},
            b4: {_id: 'b4', title: 'Pains', type: 'data', layoutEntry:{}, entries:{}},
            b5: {_id: 'b5', title: 'Customer Job(s)', type: 'data', layoutEntry:{}, entries:{}}
          }
        },
        'exampleID-3' : {
          _id : 'exampleID-3',
          tags: [],
          options: {...defaultOptions},
          canvasType : 'CUSTOMER_JOURNEY',
          buildingBlocks : {
            b0: {_id: 'b0', title: 'Advertisement', type: 'data', layoutEntry:{}, entries:{}},
            b1: {_id: 'b1', title: '(Pre-) Social Media', type: 'data', layoutEntry:{}, entries:{}},
            b2: {_id: 'b2', title: '(Pre-) Word-of-Mouth', type: 'data', layoutEntry:{}, entries:{}},
            b3: {_id: 'b3', title: 'Past Experiences', type: 'data', layoutEntry:{}, entries:{}},
            b4: {_id: 'b4', title: 'Expactations', type: 'data', layoutEntry:{}, entries:{}},
            b5: {_id: 'b5', title: 'Service Journey', type: 'data', layoutEntry:{}, entries:{}},
            b6: {_id: 'b6', title: 'Experiences', type: 'data', layoutEntry:{}, entries:{}},
            b7: {_id: 'b7', title: 'Relationship Management', type: 'data', layoutEntry:{}, entries:{}},
            b8: {_id: 'b8', title: '(Post-) Social Media', type: 'data', layoutEntry:{}, entries:{}},
            b9: {_id: 'b9', title: '(Post-) Word-of-Mouth', type: 'data', layoutEntry:{}, entries:{}},
            b10: {_id: 'b10', title: '(Dis)Satisfaction', type: 'data', layoutEntry:{}, entries:{}},
          }
        }
      }
    }
  }
};
