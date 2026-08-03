import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Wrench,
  User,
  ClipboardList,
  Building2,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import { getMechanic } from "../services/mechanics";
import type { Mechanic } from "../types";

import { initials } from "../utils/format";


export function MechanicDetails() {
  const { id } = useParams<{ id?: string }>();

  const toast = useToast();

  const [mechanic, setMechanic] = useState<Mechanic | null>(null);

  const [loading, setLoading] = useState(true);


useEffect(() => {
  if (!id) return;

  const mechanicId = id;

  async function load() {
    try {
      const data = await getMechanic(mechanicId);

      setMechanic(data);

    } catch (err) {
      toast.error("Failed to load mechanic");
      console.error(err);

    } finally {
      setLoading(false);
    }
  }

  load();

  }, [id, toast]);



  if (loading) {
    return (
      <PageLoader label="Loading mechanic..." />
    );
  }



  if (!mechanic) {

    return (

      <Card>

        <EmptyState

          icon={<User className="h-7 w-7" />}

          title="Mechanic not found"

          action={

            <Link to="/mechanics">

              <Button variant="outline">

                <ArrowLeft className="h-4 w-4" />

                Back

              </Button>

            </Link>

          }

        />

      </Card>

    );

  }



  return (

    <div className="space-y-5">


      <Link to="/mechanics">

        <Button variant="ghost" size="sm">

          <ArrowLeft className="h-4 w-4" />

          Back

        </Button>

      </Link>



      {/* Main details */}

      <Card className="p-6">

        <div className="flex flex-col gap-5 sm:flex-row">


          <div
            className="
            flex h-16 w-16
            shrink-0
            items-center justify-center
            rounded-2xl
            bg-gradient-to-br
            from-ink-700
            to-ink-800
            text-xl
            font-bold
            text-flame-400
            "
          >

            {initials(mechanic.name)}

          </div>



          <div className="flex-1">


            <div className="flex items-center gap-3">


              <h1
                className="
                font-display
                text-2xl
                font-bold
                text-white
                "
              >

                {mechanic.name}

              </h1>



              {mechanic.isActive ? (

                <span
                  className="
                  rounded-full
                  bg-green-500/20
                  px-2 py-1
                  text-xs
                  font-semibold
                  text-green-400
                  "
                >

                  Active

                </span>


              ) : (

                <span
                  className="
                  rounded-full
                  bg-red-500/20
                  px-2 py-1
                  text-xs
                  font-semibold
                  text-red-400
                  "
                >

                  Inactive

                </span>

              )}


            </div>



            <div className="mt-4 grid gap-3 sm:grid-cols-2">


              <div className="flex items-center gap-2 text-sm text-ink-300">

                <Phone className="h-4 w-4 text-ink-400" />

                {mechanic.phone || "—"}

              </div>



              <div className="flex items-center gap-2 text-sm text-ink-300">

                <Wrench className="h-4 w-4 text-ink-400" />

                {mechanic.speciality || "No speciality"}

              </div>


            </div>


          </div>


        </div>


      </Card>




      {/* Workshop */}

      <Card className="p-5">

        <div className="flex items-start gap-3">


          <div
            className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-ink-800
            text-flame-400
            "
          >

            <Building2 className="h-5 w-5" />

          </div>



          <div>

            <p className="text-xs font-semibold uppercase text-ink-400">

              Workshop

            </p>


            <p className="mt-1 font-display text-lg font-bold text-white">

              {mechanic.workshop?.name || "—"}

            </p>



            <p className="text-sm text-ink-400">

              {mechanic.workshop?.phone || "—"}

            </p>



            <p className="text-sm text-ink-400">

              {mechanic.workshop?.address || "—"}

            </p>


          </div>


        </div>


      </Card>




      {/* Summary */}

      <div className="grid gap-4 lg:grid-cols-2">


        <Card className="p-5">

          <div className="flex items-center gap-3">


            <div
              className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              bg-ink-800
              text-flame-400
              "
            >

              <ClipboardList className="h-5 w-5" />

            </div>



            <div>

              <p className="text-xs font-semibold uppercase text-ink-400">

                Job cards completed

              </p>


              <p className="font-display text-xl font-bold text-white">

                0

              </p>


            </div>


          </div>


        </Card>




        <Card className="p-5">

          <div className="flex items-center gap-3">


            <div
              className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              bg-ink-800
              text-sky-400
              "
            >

              <Wrench className="h-5 w-5" />

            </div>



            <div>

              <p className="text-xs font-semibold uppercase text-ink-400">

                Speciality

              </p>



              <p className="font-display text-xl font-bold text-white">

                {mechanic.speciality || "—"}

              </p>


            </div>


          </div>


        </Card>


      </div>




      {/* History */}

      <Card>

        <EmptyState

          icon={<ClipboardList className="h-7 w-7" />}

          title="Job history"

          description="
          Integration of job cards completed by this mechanic will be added in the future.
          "

        />

      </Card>



    </div>

  );
}
