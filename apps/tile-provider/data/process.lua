-- Tilemaker processing configuration for Strava-style maps

-- Only process nodes containing these tags.
node_keys = {
    "place",
    "amenity",
    "shop",
    "tourism",
    "historic"
}

-- Places: cities, towns, villages, suburbs, neighbourhoods.
function node_function()
    local place = Find("place")
    local name = Find("name")

    if place ~= "" and name ~= "" then
        Layer("place")
        Attribute("class", place)
        Attribute("name:latin", name)

        if place == "city" then
            AttributeNumeric("rank", 4)
            MinZoom(4)
        elseif place == "town" then
            AttributeNumeric("rank", 6)
            MinZoom(6)
        elseif place == "village" then
            AttributeNumeric("rank", 8)
            MinZoom(9)
        elseif place == "suburb" or place == "neighbourhood" then
            AttributeNumeric("rank", 10)
            MinZoom(11)
        else
            AttributeNumeric("rank", 12)
            MinZoom(12)
        end
    end

    -- Selected POIs. Keep these at high zoom to avoid unnecessary
    -- features when viewing large areas.
    local amenity = Find("amenity")
    local shop = Find("shop")
    local tourism = Find("tourism")
    local historic = Find("historic")

    if amenity ~= "" then
        Layer("poi")
        Attribute("class", amenity)
        Attribute("name:latin", name)
        MinZoom(13)
    elseif shop ~= "" then
        Layer("poi")
        Attribute("class", shop)
        Attribute("name:latin", name)
        MinZoom(14)
    elseif tourism ~= "" then
        Layer("poi")
        Attribute("class", tourism)
        Attribute("name:latin", name)
        MinZoom(13)
    elseif historic ~= "" then
        Layer("poi")
        Attribute("class", historic)
        Attribute("name:latin", name)
        MinZoom(13)
    end
end

function way_function()
    local highway = Find("highway")
    local waterway = Find("waterway")
    local natural = Find("natural")
    local building = Find("building")
    local name = Find("name")

    -- Roads
    if highway ~= "" then
        if highway == "motorway"
        or highway == "motorway_link"
        or highway == "trunk"
        or highway == "trunk_link" then
            Layer("transportation", false)
            Attribute("class", highway)
            MinZoom(4)

        elseif highway == "primary"
        or highway == "primary_link" then
            Layer("transportation", false)
            Attribute("class", highway)
            MinZoom(6)

        elseif highway == "secondary"
        or highway == "secondary_link" then
            Layer("transportation", false)
            Attribute("class", highway)
            MinZoom(7)

        elseif highway == "tertiary"
        or highway == "tertiary_link" then
            Layer("transportation", false)
            Attribute("class", highway)
            MinZoom(9)

        elseif highway == "residential"
        or highway == "unclassified" then
            Layer("transportation", false)
            Attribute("class", "minor")
            MinZoom(11)

        elseif highway == "service" then
            Layer("transportation", false)
            Attribute("class", "service")
            MinZoom(13)

        elseif highway == "cycleway"
        or highway == "path"
        or highway == "footway"
        or highway == "pedestrian"
        or highway == "track" then
            Layer("transportation", false)
            Attribute("class", highway)
            MinZoom(13)
        end

        -- Road names
        if name ~= "" then
            if highway == "motorway"
            or highway == "trunk"
            or highway == "primary"
            or highway == "secondary" then
                Layer("transportation_name", false)
                Attribute("class", highway)
                Attribute("name:latin", name)
                MinZoom(8)

            elseif highway == "tertiary" then
                Layer("transportation_name", false)
                Attribute("class", highway)
                Attribute("name:latin", name)
                MinZoom(10)

            elseif highway == "residential"
            or highway == "unclassified" then
                Layer("transportation_name", false)
                Attribute("class", "minor")
                Attribute("name:latin", name)
                MinZoom(12)
            end
        end
    end

    -- Waterways
    if waterway == "river" then
        Layer("waterway", false)
        Attribute("class", "river")
        MinZoom(6)

    elseif waterway == "canal" then
        Layer("waterway", false)
        Attribute("class", "canal")
        MinZoom(8)

    elseif waterway == "stream" then
        Layer("waterway", false)
        Attribute("class", "stream")
        MinZoom(11)
    end

    -- Water polygons
    if natural == "water" then
        Layer("water", true)

        local water = Find("water")

        if water == "river" then
            Attribute("class", "river")
        elseif water == "reservoir" then
            Attribute("class", "reservoir")
        else
            Attribute("class", "lake")
        end

        MinZoom(5)
    end

    -- Buildings
    if building ~= "" then
        Layer("building", true)
        MinZoom(13)
    end
end