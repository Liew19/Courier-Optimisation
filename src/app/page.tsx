"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Package {
  id: string;
  weight: number;
  distance: number;
}

interface Vehicle {
  id: number;
  maxWeight: number;
  speed: number;
  availableAt: number;
}

interface Offer {
  code: string;
  discount: number;
  weightRange: [number, number];
  distanceRange: [number, number];
}

const offers: Offer[] = [
  { code: "OFR001", discount: 10, weightRange: [70, 200], distanceRange: [0, 200] },
  { code: "OFR002", discount: 7, weightRange: [100, 250], distanceRange: [50, 150] },
  { code: "OFR003", discount: 5, weightRange: [10, 150], distanceRange: [50, 250] },
];

const CourierServiceCalculator = () => {
  const [baseCost, setBaseCost] = useState<number>(100);
  const [packages, setPackages] = useState<Package[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const [pkgDetails, setPkgDetails] = useState<Package>({
    id: '',
    weight: 0,
    distance: 0,
  });

  const [vehicleDetails, setVehicleDetails] = useState<{
    maxWeight: number;
    speed: number;
  }>({
    maxWeight: 0,
    speed: 0,
  });

  const handleAddPackage = () => {
    setPackages([...packages, pkgDetails]);
    setPkgDetails({ id: "", weight: 0, distance: 0 });
  };

  const handleAddVehicle = () => {
    const id = vehicles.length + 1;
    setVehicles([...vehicles, { id, maxWeight: vehicleDetails.maxWeight, speed: vehicleDetails.speed, availableAt: 0 }]);
    setVehicleDetails({ maxWeight: 0, speed: 0 });
  };

  const calculateDeliveryCost = (pkg: Package) => {
    let deliveryCost = baseCost + pkg.weight * 10 + pkg.distance * 5;
    let discount = 0;
    let appliedOffer = null;

    for (const offer of offers) {
      const [minWeight, maxWeight] = offer.weightRange;
      const [minDistance, maxDistance] = offer.distanceRange;

      if (pkg.weight >= minWeight && pkg.weight <= maxWeight && pkg.distance >= minDistance && pkg.distance <= maxDistance) {
        discount = (offer.discount / 100) * deliveryCost;
        appliedOffer = offer.code;
        break;
      }
    }

    return {
      deliveryCost,
      discount,
      totalCost: deliveryCost - discount,
      appliedOffer,
    };
  };

  const calculateDeliveryTime = () => {
    const vehicleList = [...vehicles];
    const sortedPackages = [...packages].sort((a, b) => b.weight - a.weight);
    const tempResults: any[] = [];

    sortedPackages.forEach((pkg) => {
        const availableVehicle = vehicleList.reduce((prev, current) => 
            (current.availableAt < prev.availableAt && current.maxWeight >= pkg.weight) ? current : prev
        );

        if (availableVehicle) {
            const { deliveryCost, discount, totalCost, appliedOffer } = calculateDeliveryCost(pkg);
            const deliveryTime = availableVehicle.availableAt + (pkg.distance / availableVehicle.speed);
            
            tempResults.push({
                pkgId: pkg.id,
                weight: pkg.weight,
                distance: pkg.distance,
                offerCode: appliedOffer || "N/A",
                deliveryCost: deliveryCost.toFixed(2),
                discount: discount.toFixed(2),
                totalCost: totalCost.toFixed(2),
                estimatedDeliveryTime: deliveryTime.toFixed(2),
                vehicleId: availableVehicle.id, // Include vehicle ID in the results
            });

            // Update vehicle's next available time
            availableVehicle.availableAt = deliveryTime + (pkg.distance / availableVehicle.speed);
        }
    });

    setResults(tempResults);
};


  return (
    <Card className="w-[800px] mx-auto mt-10 p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Courier Optimisation Calculator</CardTitle>
        <CardDescription>Estimate delivery costs and time for your packages</CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="baseCost">Base Delivery Cost</Label>
              <Input
                id="baseCost"
                type="number"
                value={baseCost}
                onChange={(e) => setBaseCost(Number(e.target.value))}
                placeholder="Base Delivery Cost"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="packageId">Package ID</Label>
              <Input
                id="packageId"
                value={pkgDetails.id}
                onChange={(e) => setPkgDetails({ ...pkgDetails, id: e.target.value })}
                placeholder="Enter Package ID"
              />

              <Label htmlFor="packageWeight">Weight (kg)</Label>
              <Input
                id="packageWeight"
                type="number"
                value={pkgDetails.weight}
                onChange={(e) => setPkgDetails({ ...pkgDetails, weight: Number(e.target.value) })}
                placeholder="Enter Weight in kg"
              />

              <Label htmlFor="packageDistance">Distance (km)</Label>
              <Input
                id="packageDistance"
                type="number"
                value={pkgDetails.distance}
                onChange={(e) => setPkgDetails({ ...pkgDetails, distance: Number(e.target.value) })}
                placeholder="Enter Distance in km"
              />

              <Button type="button" onClick={handleAddPackage}>
                Add Package
              </Button>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vehicleMaxLoad">Vehicle Max Load (kg)</Label>
              <Input
                id="vehicleMaxLoad"
                type="number"
                value={vehicleDetails.maxWeight}
                onChange={(e) => setVehicleDetails({ ...vehicleDetails, maxWeight: Number(e.target.value) })}
                placeholder="Max Load in kg"
              />

              <Label htmlFor="vehicleSpeed">Vehicle Speed (km/h)</Label>
              <Input
                id="vehicleSpeed"
                type="number"
                value={vehicleDetails.speed}
                onChange={(e) => setVehicleDetails({ ...vehicleDetails, speed: Number(e.target.value) })}
                placeholder="Speed in km/h"
              />

              <Button type="button" onClick={handleAddVehicle}>
                Add Vehicle
              </Button>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setPackages([]);
          setVehicles([]);
          setResults([]);
        }}>Reset</Button>
        <Button onClick={calculateDeliveryTime}>Calculate Estimated Time for Delivery</Button>
      </CardFooter>

      <CardContent>
    <h2 className="text-lg font-semibold mb-2">Results</h2>
    {results.length > 0 ? (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-3 py-3">Package ID</th>
                    <th scope="col" className="px-3 py-3">Weight</th>
                    <th scope="col" className="px-3 py-3">Distance</th>
                    <th scope="col" className="px-3 py-3">Offer Code</th>
                    <th scope="col" className="px-3 py-3">Delivery Cost</th>
                    <th scope="col" className="px-3 py-3">Discount</th>
                    <th scope="col" className="px-3 py-3">Total Cost</th>
                    <th scope="col" className="px-3 py-3">Estimated Delivery Time</th>
                    <th scope="col" className="px-3 py-3">Vehicle ID</th> {/* New column for Vehicle ID */}
                </tr>
            </thead>
            <tbody>
                {results.map((result, index) => (
                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <th scope="row" className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {result.pkgId}
                        </th>
                        <td className="px-3 py-4">{result.weight} kg</td>
                        <td className="px-3 py-4">{result.distance} km</td>
                        <td className="px-3 py-4">{result.offerCode}</td>
                        <td className="px-3 py-4">{result.deliveryCost}</td>
                        <td className="px-3 py-4">{result.discount}</td>
                        <td className="px-3 py-4">{result.totalCost}</td>
                        <td className="px-3 py-4">{result.estimatedDeliveryTime} hours</td>
                        <td className="px-3 py-4">{result.vehicleId}</td> {/* Display Vehicle ID */}
                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <p>No results to display yet.</p>
    )}
</CardContent>

    </Card>
  );
};

export default CourierServiceCalculator;