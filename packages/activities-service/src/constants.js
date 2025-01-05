const constants = {
  findRelationsBySimilarRoute: {
    /**
     * This is somewhat arbitrary, but it's a threshold for how similar two routes need to be to be considered related.
     * The route score is a sum of the route scores from the base activity to the related activity and vice versa.
     * The route score is calculated by comparing the route coordinates of the two activities.
     * The route score is a number between 0 and 1, where 0 means the routes are completely different and 1 means the routes are identical.
     */
    SIMILARITY_THRESHOLD: 1,
    COMPRESSION_LEVEL: 0.00025,
  },
  findSimilarStartDistance: {
    /**
     *  Decimal | Places	       | Degrees	Distance
     *  :-------|:---------------|:----------------:
     *  0      	| 1.0        	   | 111 km
     *  1      	| 0.1      	     | 11.1 km
     *  2      	| 0.01      	   | 1.11 km
     *  3      	| 0.001      	   | 111 m
     *  4      	| 0.0001      	 | 11.1 m
     *  5      	| 0.00001      	 | 1.11 m
     *  6      	| 0.000001       | 111 mm
     *  7      	| 0.0000001      | 11.1 mm
     *  8      	| 0.00000001     | 1.11 mm
     */
    START_DISTANCE_CONSTRAINT: 0.0010,
    /** ## 200 meters or 656 feet */
    ACTIVITY_DISTANCE_CONSTRAINT: 200,
  }
};

module.exports = constants;
